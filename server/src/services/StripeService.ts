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

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: (pricing as any).stripeBasePriceId!,
                    quantity: 1, // Platform Base Fee
                },
                {
                    price: (pricing as any).stripeUserPriceId!,
                    quantity: userCount, // User Seats
                }
            ],
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
            where: { tenantId, isActive: true }
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
}
