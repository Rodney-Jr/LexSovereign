
import express from 'express';
import { StripeService } from '../services/StripeService';
import { authenticateToken } from '../middleware/auth';
import Stripe from 'stripe';
import { prisma } from '../db';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-11-preview' as any,
});

// 1. Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    const { planId, adminEmail } = req.body;
    try {
        const session = await StripeService.createCheckoutSession(planId, adminEmail);
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

// 3. Webhook Handler (Raw Body Required)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!sig || !webhookSecret) throw new Error("Missing signature or secret");
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`[Stripe Webhook] Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(`[Stripe] Checkout Session Completed: ${session.id}`);
            // Logic to tag tenant as paid or provision if not already done
            break;
        case 'customer.subscription.updated':
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionUpdate(subscription);
            break;
        case 'customer.subscription.deleted':
            const deletedSub = event.data.object as Stripe.Subscription;
            await handleSubscriptionDeletion(deletedSub);
            break;
        default:
            console.log(`[Stripe] Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const stripeCustomerId = subscription.customer as string;
    await prisma.tenant.updateMany({
        where: { stripeCustomerId },
        data: {
            subscriptionStatus: subscription.status,
            stripeSubscriptionId: subscription.id
        }
    });
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
    const stripeCustomerId = subscription.customer as string;
    await prisma.tenant.updateMany({
        where: { stripeCustomerId },
        data: {
            subscriptionStatus: 'canceled',
            status: 'SUSPENDED' // Suspend access on cancellation
        }
    });
}

export default router;
