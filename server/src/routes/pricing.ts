import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sovereignGuard } from '../middleware/sovereignGuard';

const router = express.Router();

// Get Pricing Config (Public for Onboarding)
router.get('/', async (req, res) => {
    try {
        const configs = await prisma.pricingConfig.findMany();

        // If no configs exist in DB, return default configs
        if (configs.length === 0) {
            const defaultConfigs = [
                {
                    id: 'Starter',
                    basePrice: 99,
                    pricePerUser: 10,
                    creditsIncluded: 0,
                    features: ['5 Users Max', 'Basic Conflict Checking', 'Standard Document Management', 'No Chatbot Widget'],
                    updatedAt: new Date()
                },
                {
                    id: 'Professional',
                    basePrice: 149,
                    pricePerUser: 15,
                    creditsIncluded: 50,
                    features: ['50 Users Max', 'Advanced Conflict Workflows', 'AI Chatbot Widget (Included)', 'Audit Logs (30 Days)', 'Priority Support'],
                    updatedAt: new Date()
                },
                {
                    id: 'Institutional',
                    basePrice: 0, // Contact Sales
                    pricePerUser: 25,
                    creditsIncluded: 0,
                    features: ['Unlimited Users', 'Multi-Entity Support', 'Full Audit Trail', 'White-Label Chatbot', 'SSO & Custom Security'],
                    updatedAt: new Date()
                }
            ];
            return res.json(defaultConfigs);
        }

        return res.json(configs);
    } catch (error: any) {
        console.error('Pricing API Error:', error);

        // P2021: Table doesn't exist (migrations not run)
        // Return default configs instead of failing
        if (error.code === 'P2021') {
            console.warn('⚠️  PricingConfig table does not exist. Returning default configs. Run migrations: npx prisma migrate deploy');
            const defaultConfigs = [
                {
                    id: 'Starter',
                    basePrice: 99,
                    pricePerUser: 10,
                    creditsIncluded: 0,
                    features: ['5 Users Max', 'Basic Conflict Checking', 'Standard Document Management', 'No Chatbot Widget'],
                    updatedAt: new Date()
                },
                {
                    id: 'Professional',
                    basePrice: 149,
                    pricePerUser: 15,
                    creditsIncluded: 50,
                    features: ['50 Users Max', 'Advanced Conflict Workflows', 'AI Chatbot Widget (Included)', 'Audit Logs (30 Days)', 'Priority Support'],
                    updatedAt: new Date()
                },
                {
                    id: 'Institutional',
                    basePrice: 0, // Contact Sales
                    pricePerUser: 25,
                    creditsIncluded: 0,
                    features: ['Unlimited Users', 'Multi-Entity Support', 'Full Audit Trail', 'White-Label Chatbot', 'SSO & Custom Security'],
                    updatedAt: new Date()
                }
            ];
            return res.json(defaultConfigs);
        }

        return res.status(500).json({ error: error.message });
    }
});

// Update Pricing Config (Global Admin Only)
router.put('/:id', sovereignGuard, authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { basePrice, pricePerUser, creditsIncluded, features, stripeBasePriceId, stripeUserPriceId } = req.body;

        const updated = await (prisma.pricingConfig as any).update({
            where: { id },
            data: {
                basePrice,
                pricePerUser,
                creditsIncluded,
                features,
                stripeBasePriceId,
                stripeUserPriceId
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update pricing configuration' });
    }
});

export default router;
