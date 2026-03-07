
import express from 'express';
import { StripeService } from '../services/StripeService';
import { authenticateToken } from '../middleware/auth';
import { stripe } from '../stripe';
import { prisma } from '../db';
import Stripe from 'stripe';

const router = express.Router();

// 1. Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    const { planId, adminEmail, userCount } = req.body;
    try {
        const session = await StripeService.createCheckoutSession(planId, adminEmail, userCount);
        res.json({ url: session.url });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Create Billing Portal Session
router.post('/portal', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(403).json({ error: "Missing tenant context" });

        const session = await StripeService.createPortalSession(tenantId);
        res.json({ url: session.url });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Procure Module
router.post('/modules/procure', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const { moduleKey } = req.body;
        if (!tenantId) return res.status(403).json({ error: "Missing tenant context" });
        if (!moduleKey) return res.status(400).json({ error: "Missing moduleKey" });

        const result = await StripeService.addModuleToSubscription(tenantId, moduleKey);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Webhook Handler (Raw Body Required)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
        return res.status(400).send("Missing signature");
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret || '');
    } catch (err: any) {
        console.error(`[Stripe Webhook] Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const customerId = session.customer as string;
                const adminEmail = session.metadata?.adminEmail;
                console.log(`[Stripe Webhook] Checkout Completed: ${adminEmail}`);

                await prisma.tenant.updateMany({
                    where: { stripeCustomerId: customerId } as any,
                    data: { status: 'active', subscriptionStatus: 'active' } as any
                });

                // Get tenantId to sync modules
                const tenant = await prisma.tenant.findFirst({ where: { stripeCustomerId: customerId } });
                if (tenant) await StripeService.syncModulesFromStripe(tenant.id);
                break;
            }
            case 'invoice.payment_succeeded': {
                const session = event.data.object as any;
                const customerId = session.customer as string;
                await prisma.tenant.updateMany({
                    where: { stripeCustomerId: customerId } as any,
                    data: { status: 'active', subscriptionStatus: 'active' } as any
                });
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeletion(subscription);
                break;
            }
            default:
                console.log(`[Stripe] Unhandled event type ${event.type}`);
        }
    } catch (error: any) {
        console.error(`[Stripe Webhook Handler Error] ${error.message}`);
    }

    res.json({ received: true });
});

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const stripeCustomerId = subscription.customer as string;

    // Find tenant by customer ID
    const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId }
    });

    if (tenant) {
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                subscriptionStatus: subscription.status,
                stripeSubscriptionId: subscription.id
            } as any
        });

        // Sync modules (e.g. if items were added/removed)
        await StripeService.syncModulesFromStripe(tenant.id);
    }
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
    const stripeCustomerId = subscription.customer as string;
    await prisma.tenant.updateMany({
        where: { stripeCustomerId } as any,
        data: {
            subscriptionStatus: 'canceled',
            status: 'SUSPENDED'
        } as any
    });
}

export default router;
