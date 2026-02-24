
import Stripe from 'stripe';
import { prisma } from '../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-11-preview' as any,
});

const PLATFORM_URL = process.env.VITE_PLATFORM_URL || 'http://localhost:3000';

export class StripeService {
    /**
     * Create a Stripe Checkout Session for a new tenant
     */
    static async createCheckoutSession(planId: string, adminEmail: string) {
        const pricing = await prisma.pricingConfig.findUnique({
            where: { id: planId }
        });

        if (!pricing || !pricing.stripeBasePriceId || !pricing.stripeUserPriceId) {
            throw new Error(`Plan ${planId} is not configured for Stripe payments (Base or User Price ID missing).`);
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: pricing.stripeBasePriceId!,
                    quantity: 1, // Platform Base Fee
                },
                {
                    price: pricing.stripeUserPriceId!,
                    quantity: 1, // Initial User Seat
                }
            ],
            mode: 'subscription',
            customer_email: adminEmail,
            success_url: `${PLATFORM_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}&status=success&plan=${planId}`,
            cancel_url: `${PLATFORM_URL}/onboarding?status=cancelled`,
            metadata: {
                planId,
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
            select: { stripeCustomerId: true }
        });

        if (!tenant?.stripeCustomerId) {
            throw new Error("Tenant does not have a Stripe Customer ID.");
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: tenant.stripeCustomerId,
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
            select: { stripeSubscriptionId: true, plan: true }
        });

        if (!tenant?.stripeSubscriptionId) return;

        const pricing = await prisma.pricingConfig.findUnique({
            where: { id: tenant.plan }
        });

        if (!pricing || !pricing.stripeUserPriceId) {
            console.error(`[Stripe] Cannot sync quantity: Plan ${tenant.plan} not configured with User Price ID.`);
            return;
        }

        const userCount = await prisma.user.count({
            where: { tenantId, isActive: true }
        });

        // Fetch subscription to get the per-user item ID
        const subscription = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);

        // Find the item specifically for the per-user price
        const subscriptionItemId = subscription.items.data.find(item => item.price.id === pricing.stripeUserPriceId)?.id;

        if (subscriptionItemId) {
            await stripe.subscriptionItems.update(subscriptionItemId, {
                quantity: userCount,
            });
            console.log(`[Stripe] Synced tenant ${tenantId} to ${userCount} seats.`);
        }
    }
}
