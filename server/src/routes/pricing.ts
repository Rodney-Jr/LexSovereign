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
                    id: 'Standard',
                    basePrice: 99,
                    pricePerUser: 10,
                    creditsIncluded: 500,
                    features: ['Multi-tenant Storage', 'Base Guardrails', '500 AI Credits'],
                    updatedAt: new Date()
                },
                {
                    id: 'Sovereign',
                    basePrice: 499,
                    pricePerUser: 15,
                    creditsIncluded: 10000,
                    features: ['Dedicated Partition', 'Full RRE Engine', '10,000 AI Credits', 'BYOK Ready'],
                    updatedAt: new Date()
                },
                {
                    id: 'Enclave Exclusive',
                    basePrice: 1999,
                    pricePerUser: 25,
                    creditsIncluded: 0,
                    features: ['Physical TEE Access', 'Forensic Ledger', 'Zero-Knowledge Sync', 'Unlimited Credits'],
                    updatedAt: new Date()
                }
            ];
            return res.json(defaultConfigs);
        }

        return res.json(configs);
    } catch (error: any) {
        console.error('Pricing API Error:', error);

        // ALWAYS return default configs instead of 500
        // This ensures the marketing site remains functional even if DB is down
        console.warn('⚠️  Returning default pricing configurations due to error.');

        const defaultConfigs = [
            {
                id: 'Standard',
                basePrice: 99,
                pricePerUser: 10,
                creditsIncluded: 500,
                features: ['Multi-tenant Storage', 'Base Guardrails', '500 AI Credits'],
                updatedAt: new Date()
            },
            {
                id: 'Sovereign',
                basePrice: 499,
                pricePerUser: 15,
                creditsIncluded: 10000,
                features: ['Dedicated Partition', 'Full RRE Engine', '10,000 AI Credits', 'BYOK Ready'],
                updatedAt: new Date()
            },
            {
                id: 'Enclave Exclusive',
                basePrice: 1999,
                pricePerUser: 25,
                creditsIncluded: 0,
                features: ['Physical TEE Access', 'Forensic Ledger', 'Zero-Knowledge Sync', 'Unlimited Credits'],
                updatedAt: new Date()
            }
        ];

        return res.json(defaultConfigs);
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
