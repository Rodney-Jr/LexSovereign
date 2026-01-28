import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

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

        res.json(configs);
    } catch (error: any) {
        console.error('Pricing API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Pricing Config (Global Admin Only)
router.put('/:id', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
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
