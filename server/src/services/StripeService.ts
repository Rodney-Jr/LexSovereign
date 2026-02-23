
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

        if (!pricing || !pricing.stripePriceId) {
            throw new Error(`Plan ${planId} is not configured for Stripe payments.`);
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: pricing.stripePriceId,
                    quantity: 1, // Base subscription
                },
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
            select: { stripeSubscriptionId: true }
        });

        if (!tenant?.stripeSubscriptionId) return;

        const userCount = await prisma.user.count({
            where: { tenantId, isActive: true }
        });

        // Fetch subscription to get the item ID
        const subscription = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
        const subscriptionItemId = subscription.items.data[0]?.id;

        if (subscriptionItemId) {
            await stripe.subscriptionItems.update(subscriptionItemId, {
                quantity: userCount,
            });
            console.log(`[Stripe] Synced tenant ${tenantId} to ${userCount} seats.`);
        }
    }
}
