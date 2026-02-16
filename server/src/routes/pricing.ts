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
                    id: 'STARTER',
                    basePrice: 99,
                    pricePerUser: 10,
                    creditsIncluded: 0,
                    features: ['Multi-tenant Storage', 'Base Guardrails', 'No Chatbot Widget'],
                    updatedAt: new Date()
                },
                {
                    id: 'PROFESSIONAL',
                    basePrice: 149,
                    pricePerUser: 15,
                    creditsIncluded: 50,
                    features: ['Dedicated Partition', 'Full RRE Engine', 'AI Chatbot Widget (50 Credits)', 'BYOK Ready'],
                    updatedAt: new Date()
                },
                {
                    id: 'INSTITUTIONAL',
                    basePrice: 0, // Contact Sales
                    pricePerUser: 25,
                    creditsIncluded: 0,
                    features: ['Physical TEE Access', 'Forensic Ledger', 'Zero-Knowledge Sync', 'White-Label Chatbot (Unlimited)'],
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
                    id: 'STARTER',
                    basePrice: 99,
                    pricePerUser: 10,
                    creditsIncluded: 0,
                    features: ['Multi-tenant Storage', 'Base Guardrails', 'No Chatbot Widget'],
                    updatedAt: new Date()
                },
                {
                    id: 'PROFESSIONAL',
                    basePrice: 149,
                    pricePerUser: 15,
                    creditsIncluded: 50,
                    features: ['Dedicated Partition', 'Full RRE Engine', 'AI Chatbot Widget (50 Credits)', 'BYOK Ready'],
                    updatedAt: new Date()
                },
                {
                    id: 'INSTITUTIONAL',
                    basePrice: 0, // Contact Sales
                    pricePerUser: 25,
                    creditsIncluded: 0,
                    features: ['Physical TEE Access', 'Forensic Ledger', 'Zero-Knowledge Sync', 'White-Label Chatbot (Unlimited)'],
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
        const { basePrice, pricePerUser, creditsIncluded, features } = req.body;

        const updated = await prisma.pricingConfig.update({
            where: { id },
            data: {
                basePrice,
                pricePerUser,
                creditsIncluded,
                features
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update pricing configuration' });
    }
});

export default router;
