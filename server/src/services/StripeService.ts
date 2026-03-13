import { stripe } from '../stripe';
import { prisma } from '../db';

const PLATFORM_URL = process.env.VITE_PLATFORM_URL || 'http://localhost:3000';

export class StripeService {
    /**
     * Create a Stripe Checkout Session for a new tenant
     */
    static async createCheckoutSession(planId: string, adminEmail: string, userCount: number = 1) {
        const pricing = await prisma.pricingConfig.findFirst({
            where: { id: { equals: planId, mode: 'insensitive' } }
        });

        if (!pricing || !(pricing as any).stripeBasePriceId || !(pricing as any).stripeUserPriceId) {
            throw new Error(`Plan ${planId} is not configured for Stripe payments (Base or User Price ID missing).`);
        }

        const lineItems: any[] = [
            {
                price: (pricing as any).stripeBasePriceId!,
                quantity: 1, // Platform Base Fee
            },
            {
                price: (pricing as any).stripeUserPriceId!,
                quantity: userCount, // User Seats
            }
        ];

        // Add Metered Prices (AI and Storage) if configured
        if ((pricing as any).stripeAiPriceId) {
            lineItems.push({
                price: (pricing as any).stripeAiPriceId!,
                // Metered items in a subscription usually don't have quantities, but Stripe Checkout
                // handles them as line items with usage_type=metered.
            });
        }
        if ((pricing as any).stripeStoragePriceId) {
            lineItems.push({
                price: (pricing as any).stripeStoragePriceId!,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'subscription',
            customer_email: adminEmail,
            success_url: `${PLATFORM_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}&status=success&plan=${planId}`,
            cancel_url: `${PLATFORM_URL}/onboarding?status=cancelled`,
            metadata: {
                planId: (pricing as any).id,
                adminEmail
            }
        });

        return session;
    }

    /**
     * Create a Stripe Customer Portal session for an existing tenant
     */
    static async createPortalSession(tenantId: string) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { id: true, stripeCustomerId: true } as any
        });

        if (!tenant?.stripeCustomerId) {
            throw new Error("Tenant does not have a Stripe Customer ID.");
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: (tenant as any).stripeCustomerId,
            return_url: `${PLATFORM_URL}/settings/billing`,
        });

        return session;
    }

    /**
     * Sync subscription quantity based on active user count
     * Industry Standard for per-seat billing
     */
    static async syncSubscriptionQuantity(tenantId: string) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { id: true, stripeSubscriptionId: true, plan: true } as any
        });

        if (!tenant || !(tenant as any).stripeSubscriptionId) return;

        const pricing = await prisma.pricingConfig.findFirst({
            where: { id: { equals: (tenant as any).plan as string, mode: 'insensitive' } }
        });

        if (!pricing || !(pricing as any).stripeUserPriceId) {
            console.error(`[Stripe] Cannot sync quantity: Plan ${(tenant as any).plan} not configured with User Price ID.`);
            return;
        }

        const userCount = await prisma.user.count({
            where: { 
                tenantId, 
                isActive: true,
                roleString: {
                    notIn: ['CLIENT', 'EXTERNAL_COUNSEL']
                }
            }
        });

        // Fetch subscription to get the per-user item ID
        const subscription = await stripe.subscriptions.retrieve((tenant as any).stripeSubscriptionId as string);

        // Find the item specifically for the per-user price
        const subscriptionItemId = subscription.items.data.find(item => item.price.id === (pricing as any).stripeUserPriceId)?.id;

        if (subscriptionItemId) {
            await stripe.subscriptionItems.update(subscriptionItemId, {
                quantity: userCount,
            });
            console.log(`[Stripe] Synced tenant ${tenantId} to ${userCount} seats.`);
        }
    }

    /**
     * Add a billable module to a tenant's active subscription
     */
    static async addModuleToSubscription(tenantId: string, moduleKey: 'ACCOUNTING_HUB' | 'HR_ENTERPRISE') {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { id: true, stripeSubscriptionId: true, plan: true, enabledModules: true } as any
        });

        if (!tenant || !(tenant as any).stripeSubscriptionId) {
            throw new Error("Tenant does not have an active Stripe subscription.");
        }

        const pricing = await prisma.pricingConfig.findFirst({
            where: { id: { equals: (tenant as any).plan as string, mode: 'insensitive' } }
        });

        if (!pricing) throw new Error("Pricing configuration not found.");

        let priceId = '';
        if (moduleKey === 'ACCOUNTING_HUB') priceId = (pricing as any).stripeAccountingPriceId;
        if (moduleKey === 'HR_ENTERPRISE') priceId = (pricing as any).stripeHrEnterprisePriceId;

        if (!priceId) {
            throw new Error(`Module ${moduleKey} is not configured for billing in plan ${(tenant as any).plan}`);
        }

        // Check if already in enabledModules to prevent double-billing (though Stripe update handles this)
        if ((tenant as any).enabledModules?.includes(moduleKey)) {
            return { message: "Module already active." };
        }

        // Add the module as a new subscription item
        await stripe.subscriptionItems.create({
            subscription: (tenant as any).stripeSubscriptionId as string,
            price: priceId,
            quantity: 1,
        });

        // Update tenant's enabledModules
        const updatedModules = [...((tenant as any).enabledModules || []), moduleKey];
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { enabledModules: updatedModules } as any
        });

        return { success: true, module: moduleKey };
    }

    /**
     * Sync enabled modules from Stripe subscription (useful for webhooks or manual recovery)
     */
    static async syncModulesFromStripe(tenantId: string) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { id: true, stripeSubscriptionId: true, plan: true } as any
        });

        if (!tenant || !(tenant as any).stripeSubscriptionId) return;

        const pricing = await prisma.pricingConfig.findFirst({
            where: { id: { equals: (tenant as any).plan as string, mode: 'insensitive' } }
        });

        if (!pricing) return;

        const subscription = await stripe.subscriptions.retrieve((tenant as any).stripeSubscriptionId as string);
        const activePriceIds = subscription.items.data.map(item => item.price.id);

        const modules: string[] = ['CORE']; // CORE is always active
        if (activePriceIds.includes((pricing as any).stripeAccountingPriceId)) modules.push('ACCOUNTING_HUB');
        if (activePriceIds.includes((pricing as any).stripeHrEnterprisePriceId)) modules.push('HR_ENTERPRISE');

        await prisma.tenant.update({
            where: { id: tenantId },
            data: { enabledModules: modules } as any
        });

        console.log(`[Stripe] Synced modules for tenant ${tenantId}: ${modules.join(', ')}`);
    }

    /**
     * Fetch recent invoices for a tenant
     */
    static async getInvoices(stripeCustomerId: string, limit = 5) {
        if (!stripeCustomerId) return [];
        const invoices = await stripe.invoices.list({
            customer: stripeCustomerId,
            limit,
        });

        return invoices.data.map(inv => ({
            id: inv.id,
            cycle: inv.period_end ? new Date(inv.period_end * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown',
            delta: inv.lines.data.map(l => l.description).join(', '),
            amount: `$${(inv.amount_paid / 100).toFixed(2)}`,
            status: inv.status?.toUpperCase() || 'UNKNOWN',
            downloadUrl: inv.invoice_pdf
        }));
    }
    /**
     * Sync AI credits and Storage consumption to Stripe Metered Prices
     */
    static async syncUsageToStripe(tenantId: string) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { aiUsages: { where: { stripeSyncedAt: null } } } as any
        });

        if (!tenant || !(tenant as any).stripeSubscriptionId) return;

        const pricing = await prisma.pricingConfig.findFirst({
            where: { id: { equals: (tenant as any).plan as string, mode: 'insensitive' } }
        });

        if (!pricing) return;

        // 1. Sync AI Credits
        const unsyncedAi = (tenant as any).aiUsages || [];
        if (unsyncedAi.length > 0) {
            const totalCredits = Math.ceil(unsyncedAi.reduce((sum: number, u: any) => sum + (u.costCredits || 0), 0));

            if (totalCredits > 0) {
                // Using the NEW Stripe Meter Events API (Acacia/2025 onwards)
                await stripe.billing.meterEvents.create({
                    event_name: 'ai_credits',
                    payload: {
                        value: totalCredits.toString(),
                        stripe_customer_id: (tenant as any).stripeCustomerId as string
                    }
                });

                // Mark as synced
                await (prisma as any).aIUsage.updateMany({
                    where: { id: { in: unsyncedAi.map((u: any) => u.id) } },
                    data: { stripeSyncedAt: new Date() }
                });

                console.log(`[Stripe Sync] Synced ${totalCredits} AI credits for tenant ${tenantId}`);
            }
        }

        // 2. Sync Storage (GB)
        const results: any = await prisma.$queryRaw`
            SELECT SUM(COALESCE("fileSize", 0)) as total 
            FROM "Document" 
            WHERE "tenantId" = ${tenantId}
        `;
        const totalBytes = Number(results[0]?.total || 0);
        const totalGB = Math.ceil(totalBytes / (1024 * 1024 * 1024));

        if (totalGB > 0) {
            await stripe.billing.meterEvents.create({
                event_name: 'storage_usage',
                payload: {
                    value: totalGB.toString(),
                    stripe_customer_id: (tenant as any).stripeCustomerId as string
                }
            });

            await prisma.tenant.update({
                where: { id: tenantId },
                data: { lastStorageSyncedAt: new Date() } as any
            });

            console.log(`[Stripe Sync] Synced ${totalGB}GB storage for tenant ${tenantId}`);
        }
    }
}
