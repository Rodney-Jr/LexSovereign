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
        const flatFeeComponent = components.find(c => c.type === BillingComponentType.FLAT_FEE);
        if (flatFeeComponent && flatFeeComponent.fixedAmount) {

            // Checking if we already invoiced this flat fee (naive check for deposit/upfront generation)
            const existingInvoices = await prisma.invoiceLineItem.count({
                where: { billingComponentId: flatFeeComponent.id }
            });

            if (existingInvoices === 0 && flatFeeComponent.depositRequired) {
                // Rule: "Require deposit before work commencement"
                // Assuming schedule defines deposit ratio, or we just bill the whole FlatFee if simple
                const schedule: any = flatFeeComponent.paymentSchedule || {};
                const depositPercentage = schedule.depositPercentage || 100; // default 100% upfront

                const amountToBill = (flatFeeComponent.fixedAmount * depositPercentage) / 100;

                totalInvoiceAmount += amountToBill;
                lineItemsData.push({
                    billingComponentId: flatFeeComponent.id,
                    amount: amountToBill,
                    description: `Flat Fee: Initial Deposit / Upfront Payment (${depositPercentage}%)`
                });
            }
        }

        // Generate Invoice if there are actionable items
        if (lineItemsData.length > 0) {
            const invoice = await prisma.invoice.create({
                data: {
                    matterId,
                    tenantId,
                    status: InvoiceStatus.DRAFT,
                    totalAmount: totalInvoiceAmount,
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default Net 14
                    lineItems: {
                        create: lineItemsData
                    }
                },
                include: { lineItems: true }
            });

            await prisma.auditLog.create({
                data: {
                    action: 'INVOICE_GENERATED',
                    matterId,
                    details: `Generated Auto-Invoice based on triggers. Amount: ${totalInvoiceAmount}`
                }
            });

            return invoice;
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
        return await prisma.invoice.findMany({
            where: { tenantId },
            include: {
                matter: {
                    select: { name: true, client: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * NEW: Fetches full details for a specific invoice, including line items.
     */
    static async getInvoiceDetails(invoiceId: string, tenantId: string) {
        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, tenantId },
            include: {
                matter: true,
                lineItems: {
                    include: {
                        billingComponent: true
                    }
                }
            }
        });

        if (!invoice) throw new Error("Invoice not found or access denied");
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
}
