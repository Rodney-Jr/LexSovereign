import { PrismaClient, BillingComponentType, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class BillingService {

    /**
     * Creates a new BillingComponent for a Matter.
     * Validates combination rules (e.g., Flat Fee vs Hybrid priorities).
     */
    static async createBillingComponent(
        matterId: string,
        type: BillingComponentType,
        config: {
            fixedAmount?: number;
            paymentSchedule?: any;
            depositRequired?: boolean;
            priority?: number;
        }
    ) {
        // Validation: Verify Matter exists
        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            include: { billingComponents: true }
        });

        if (!matter) throw new Error("Matter not found");

        // Rule: Avoid overlapping duplicate Flat Fees unless explicitly separated by priority
        if (type === BillingComponentType.FLAT_FEE) {
            const temp = matter.billingComponents.find(c => c.type === BillingComponentType.FLAT_FEE && c.isActive);
            if (temp) {
                console.warn(`[BillingService] Matter ${matterId} already has an active Flat Fee component.`);
            }
        }

        const component = await prisma.billingComponent.create({
            data: {
                matterId,
                type,
                fixedAmount: config.fixedAmount,
                paymentSchedule: config.paymentSchedule || {},
                depositRequired: config.depositRequired || false,
                priority: config.priority || (type === BillingComponentType.FLAT_FEE ? 10 : 0) // Flat Fees default to high priority
            }
        });

        // Audit Log Generation
        await prisma.auditLog.create({
            data: {
                action: 'BILLING_COMPONENT_CREATED',
                matterId,
                details: `Created ${type} component. Config: ${JSON.stringify(config)}`
            }
        });

        return component;
    }

    /**
     * Initializes the invoicing engine for a matter.
     * Evaluates all active components. If FlatFee with DepositRequired is active, cuts the first invoice instantly.
     */
    static async evaluateInvoicingTriggers(matterId: string, tenantId: string) {
        const components = await prisma.billingComponent.findMany({
            where: { matterId, isActive: true },
            orderBy: { priority: 'desc' }
        });

        if (components.length === 0) return null;

        let totalInvoiceAmount = 0;
        const lineItemsData: any[] = [];

        // Evaluate FlatFee triggers
        // A flat fee invoice is generated whenever:
        //   (a) a FLAT_FEE billing component exists with a fixedAmount, AND
        //   (b) no line item has been issued against it yet (prevents double billing)
        // depositRequired only controls the label — it does NOT block invoice generation.
        const flatFeeComponent = components.find(c => c.type === BillingComponentType.FLAT_FEE);
        if (flatFeeComponent && flatFeeComponent.fixedAmount) {
            console.log(`[BillingService] Evaluating FlatFee for component ${flatFeeComponent.id}. Amount: ${flatFeeComponent.fixedAmount}`);

            const existingInvoices = await prisma.invoiceLineItem.count({
                where: { billingComponentId: flatFeeComponent.id }
            });

            console.log(`[BillingService] Found ${existingInvoices} existing invoice items for component ${flatFeeComponent.id}`);

            if (existingInvoices === 0) {
                const schedule: any = flatFeeComponent.paymentSchedule || {};
                const depositPercentage = schedule.depositPercentage || 100; // default 100% upfront

                const amountToBill = (flatFeeComponent.fixedAmount * depositPercentage) / 100;

                const description = flatFeeComponent.depositRequired
                    ? `Flat Fee: Initial Deposit (${depositPercentage}% upfront)`
                    : `Flat Fee: Full Payment — ${flatFeeComponent.fixedAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;

                console.log(`[BillingService] Triggering invoice line item: ${description} | Amount: ${amountToBill}`);
                totalInvoiceAmount += amountToBill;
                lineItemsData.push({
                    billingComponentId: flatFeeComponent.id,
                    amount: amountToBill,
                    description
                });
            }
        }

        // --- NEW: Automated Disbursement Inclusion ---
        // Fetch un-invoiced AI Usage for this matter
        const uninvoicedAi = await (prisma as any).aIUsage.findMany({
            where: { matterId, invoiceId: null }
        });

        if (uninvoicedAi.length > 0) {
            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantId },
                select: { attributes: true }
            });
            const attributes = (tenant?.attributes as any) || {};
            const creditPrice = attributes.aiCreditPrice || 0.05;

            const totalAiCredits = uninvoicedAi.reduce((sum: number, u: any) => sum + u.costCredits, 0);
            const aiDisbursementAmount = totalAiCredits * creditPrice;

            if (aiDisbursementAmount > 0) {
                totalInvoiceAmount += aiDisbursementAmount;
                lineItemsData.push({
                    amount: aiDisbursementAmount,
                    description: `AI Legal Analysis Disbursements (${totalAiCredits.toFixed(2)} Credits)`
                });
            }
        }

        // Fetch Storage snapshot if not yet invoiced in a reasonable window
        // For simplicity, we'll check if any 'Storage' line item exists in the last 25 days
        const recentStorageItem = await prisma.invoiceLineItem.findFirst({
            where: {
                description: { contains: 'Digital Enclave Preservation' },
                invoice: { matterId, createdAt: { gte: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) } }
            }
        });

        if (!recentStorageItem) {
            const usage = await this.getMatterUsage(matterId, tenantId);
            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantId },
                select: { attributes: true }
            });
            const attributes = (tenant?.attributes as any) || {};
            const storageRatePerGB = attributes.storageRatePerGB || 2.0;

            const storageAmount = parseFloat(usage.storageUsage.usedGB) * storageRatePerGB;
            if (storageAmount > 0) {
                totalInvoiceAmount += storageAmount;
                lineItemsData.push({
                    amount: storageAmount,
                    description: `Digital Enclave Preservation (${usage.storageUsage.usedGB} GB)`
                });
            }
        }
        // --- END Disbursements ---

        // --- NEW: Time Entries Inclusion ---
        // Fetch unbilled Time Entries for this matter
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { attributes: true }
        });
        const attributes = (tenant?.attributes as any) || {};
        const globalHourlyRate = attributes.hourlyRate || 250; 

        const unbilledTimeEntries = await prisma.timeEntry.findMany({
            where: { matterId, isBillable: true, status: 'Draft' }
        });

        if (unbilledTimeEntries.length > 0) {
            for (const entry of unbilledTimeEntries) {
                const amount = (entry.durationMinutes / 60) * globalHourlyRate;
                if (amount > 0) {
                    totalInvoiceAmount += amount;
                    lineItemsData.push({
                        amount: amount,
                        description: `Time Entry (${entry.durationMinutes} mins): ${entry.description}`,
                        // we pass a reference to update it later, stripping it before Prisma create
                        _timeEntryId: entry.id 
                    });
                }
            }
        }
        // --- END Time Entries ---

        // Generate Invoice if there are actionable items
        if (lineItemsData.length > 0) {
            // Because lineItemsData may include _timeEntryId, we need to map them slightly
            const invoice = await prisma.invoice.create({
                data: {
                    matterId,
                    tenantId,
                    status: InvoiceStatus.DRAFT,
                    totalAmount: totalInvoiceAmount,
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default Net 14
                    lineItems: {
                        create: lineItemsData.map(li => ({
                            amount: li.amount,
                            description: li.description,
                            billingComponentId: li.billingComponentId
                        }))
                    }
                },
                include: { lineItems: true }
            });

            console.log(`[BillingService] Created DRAFT invoice ${invoice.id} for matter ${matterId}. Amount: ${totalInvoiceAmount}`);

            // Mark Time Entries as invoiced
            if (unbilledTimeEntries.length > 0) {
                const timeEntryIds = lineItemsData.filter(li => li._timeEntryId).map(li => li._timeEntryId);
                if (timeEntryIds.length > 0) {
                    await prisma.timeEntry.updateMany({
                        where: { id: { in: timeEntryIds } },
                        data: { status: 'Invoiced' }
                    });
                }
            }

            // Mark AI records as invoiced
            if (uninvoicedAi.length > 0) {
                await (prisma as any).aIUsage.updateMany({
                    where: { id: { in: uninvoicedAi.map((u: any) => u.id) } },
                    data: { invoiceId: invoice.id }
                });
            }

            await prisma.auditLog.create({
                data: {
                    action: 'INVOICE_GENERATED',
                    matterId,
                    details: `Generated Auto-Invoice based on triggers. Amount: ${totalInvoiceAmount}`
                }
            });

            return invoice;
        } else {
            console.log(`[BillingService] No actionable billing items for matter ${matterId}. Skip invoice.`);
        }

        return null; // Nothing triggered
    }

    /**
     * Modifies a FlatFee amount. Requires explicit audit tracking.
     */
    static async updateFlatFeeAmount(componentId: string, newAmount: number, userId: string, justification: string) {
        const component = await prisma.billingComponent.findUnique({
            where: { id: componentId, type: BillingComponentType.FLAT_FEE },
            include: { lineItems: true }
        });

        if (!component) throw new Error("Component not found or not Flat Fee");

        // Locking rule: Check if already invoiced
        if (component.lineItems.length > 0) {
            // "Lock FlatFee amount after first invoice issuance" - Override check required here conceptually
            console.warn(`[BillingService] Modifying locked FlatFee Component ${componentId}.`);
        }

        const updated = await prisma.billingComponent.update({
            where: { id: componentId },
            data: { fixedAmount: newAmount }
        });

        await prisma.auditLog.create({
            data: {
                action: 'FLAT_FEE_MODIFIED',
                matterId: component.matterId,
                userId,
                details: `Modified Flat Fee from ${component.fixedAmount} to ${newAmount}. Justification: ${justification}`
            }
        });

        return updated;
    }

    /**
     * Aggregates financials for a given tenant and matter type (CASE or CLM)
     */
    static async getAggregateFinancials(tenantId: string, matterType: 'CASE' | 'CONTRACT') {
        const matters = await prisma.matter.findMany({
            where: { tenantId, type: matterType },
            include: {
                timeEntries: {
                    where: { isBillable: true }
                },
                billingComponents: {
                    where: { isActive: true },
                    include: {
                        lineItems: {
                            include: { invoice: true }
                        }
                    }
                }
            }
        });

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { attributes: true }
        });
        const attributes = (tenant?.attributes as any) || {};
        const hourlyRate = attributes.hourlyRate || 250; // Use tenant specific rate or default

        let flatFee = 0;
        let hourly = 0;
        let hybrid = 0;
        const installments: any[] = [];

        for (const matter of matters) {
            const hasFlatFee = matter.billingComponents.some(c => c.type === BillingComponentType.FLAT_FEE);
            const hasHourly = matter.billingComponents.some(c => c.type === BillingComponentType.HOURLY);

            // Calculate actual hourly revenue from time entries for this matter
            const matterHourlyTotal = matter.timeEntries.reduce((sum, entry) => {
                const hours = entry.durationMinutes / 60;
                return sum + (hours * hourlyRate);
            }, 0);

            let matterComponentType = 'Unknown';
            if (hasFlatFee && hasHourly) {
                matterComponentType = 'Hybrid (Flat + Hourly)';
                hybrid += matterHourlyTotal; // For hybrid, we track hourly as part of the total
            } else if (hasFlatFee) {
                matterComponentType = 'Flat Fee';
            } else if (hasHourly) {
                matterComponentType = 'Hourly';
                hourly += matterHourlyTotal;
            }

            for (const comp of matter.billingComponents) {
                if (comp.type === BillingComponentType.FLAT_FEE) {
                    if (hasHourly) hybrid += comp.fixedAmount || 0;
                    else flatFee += comp.fixedAmount || 0;

                    // If Flat Fee, calculate remaining balance
                    if (comp.fixedAmount) {
                        const invoicedAmount = comp.lineItems.reduce((sum, item) => sum + item.amount, 0);
                        const remaining = comp.fixedAmount - invoicedAmount;

                        if (remaining > 0) {
                            const schedule: any = comp.paymentSchedule || {};
                            const status = schedule.nextMilestone || (comp.depositRequired && invoicedAmount === 0 ? "Initial Deposit" : "Final Settlement");

                            installments.push({
                                id: comp.id,
                                matterId: matter.id,
                                matterName: matter.name,
                                componentType: matterComponentType,
                                remainingBalance: remaining,
                                nextTranche: status
                            });
                        }
                    }
                }
            }
        }

        return {
            revenue: {
                flatFee,
                hourly,
                hybrid
            },
            installments
        };
    }

    /**
     * NEW: Fetches all matter-level invoices for a tenant.
     */
    static async getTenantInvoices(tenantId: string) {
        const invoices = await prisma.invoice.findMany({
            where: { tenantId },
            include: {
                matter: {
                    select: { name: true, clientRef: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return (invoices as any[]).map((i: any) => ({
            ...i,
            matter: {
                ...i.matter,
                client: i.matter.clientRef?.name || 'Unknown Client'
            }
        }));
    }

    /**
     * NEW: Fetches full details for a specific invoice, including line items.
     */
    static async getInvoiceDetails(invoiceId: string, tenantId: string) {
        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, tenantId },
            include: {
                matter: { include: { clientRef: true } },
                lineItems: {
                    include: {
                        billingComponent: true
                    }
                }
            }
        });

        if (invoice) {
            (invoice.matter as any).client = invoice.matter.clientRef?.name || 'Unknown Client';
        } else {
            throw new Error("Invoice not found or access denied");
        }

        return invoice;
    }

    /**
     * NEW: Updates invoice status.
     */
    static async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus, tenantId: string) {
        // Security check
        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, tenantId }
        });

        if (!invoice) throw new Error("Invoice not found or access denied");

        const updated = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status,
                issuedAt: status === InvoiceStatus.ISSUED ? new Date() : undefined,
                paidAt: status === InvoiceStatus.PAID ? new Date() : undefined
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'INVOICE_STATUS_UPDATED',
                matterId: invoice.matterId,
                details: `Invoice ${invoiceId} status updated to ${status}`
            }
        });

        return updated;
    }
    /**
     * Aggregates AI and Storage usage for a specific matter.
     */
    static async getMatterUsage(matterId: string, tenantId: string) {
        // Verify matter belongs to tenant
        const matter = await prisma.matter.findFirst({
            where: { id: matterId, tenantId },
            select: { id: true, name: true }
        });

        if (!matter) throw new Error("Matter not found or access denied");

        // 1. Aggregate AI Usage
        const aiAgg = await (prisma as any).aIUsage.aggregate({
            where: { matterId },
            _sum: {
                promptTokens: true,
                completionTokens: true,
                totalTokens: true,
                costCredits: true
            }
        });

        // 2. Aggregate Storage Usage
        const storageAgg = await (prisma.document as any).aggregate({
            where: { matterId },
            _sum: { fileSize: true }
        });

        const totalBytes = Number(storageAgg._sum.fileSize || 0);
        const storageUsedGB = (totalBytes / (1024 ** 3)).toFixed(4);

        return {
            matterId,
            matterName: matter.name,
            aiUsage: {
                promptTokens: aiAgg._sum.promptTokens || 0,
                completionTokens: aiAgg._sum.completionTokens || 0,
                totalTokens: aiAgg._sum.totalTokens || 0,
                costCredits: Number(aiAgg._sum.costCredits || 0).toFixed(2)
            },
            storageUsage: {
                totalBytes,
                usedGB: storageUsedGB
            }
        };
    }

    /**
     * Generates a CSV for Law Firms to attach to their clients' bills.
     */
    static async generateClientDisbursementCSV(matterId: string, tenantId: string) {
        const usage = await this.getMatterUsage(matterId, tenantId);
        const matter = await prisma.matter.findUnique({
            where: { id: matterId },
            select: { name: true, clientRef: true }
        });

        if (!matter) throw new Error("Matter not found");

        const aiRecords = await (prisma as any).aIUsage.findMany({
            where: { matterId },
            orderBy: { createdAt: 'desc' }
        });

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { attributes: true }
        });
        const attributes = (tenant?.attributes as any) || {};
        const creditPrice = attributes.aiCreditPrice || 0.05;
        const storageRatePerGB = attributes.storageRatePerGB || 2.0; // Default $2/GB/month

        let csv = `"Date","Service","Description","Units","Credits","Rate","Amount"\n`;

        // Add AI Usage rows
        for (const record of aiRecords) {
            const amount = (record.costCredits * creditPrice).toFixed(4);
            const date = record.createdAt.toISOString().split('T')[0];
            const escapedModel = record.modelId.replace(/"/g, '""');
            csv += `"${date}","AI Legal Analysis","AI Assistance (${escapedModel})","${record.totalTokens} tokens","${record.costCredits}","${creditPrice}","${amount}"\n`;
        }

        // Add Storage row (Consolidated current snapshot)
        if (parseFloat(usage.storageUsage.usedGB) > 0) {
            const storageAmount = (parseFloat(usage.storageUsage.usedGB) * storageRatePerGB).toFixed(2);
            csv += `"${new Date().toISOString().split('T')[0]}","Storage","Digital Enclave Preservation","${usage.storageUsage.usedGB} GB","N/A","${storageRatePerGB}","${storageAmount}"\n`;
        }

        return csv;
    }
}
