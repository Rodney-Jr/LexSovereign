import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get Pricing Config (Public for Onboarding)
router.get('/', async (req, res) => {
    try {
        const configs = await prisma.pricingConfig.findMany();
        res.json(configs);
    } catch (error: any) {
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
