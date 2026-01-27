import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get regulatory rules (scoped by region if provided, otherwise all active)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { region } = req.query;

        const rules = await prisma.regulatoryRule.findMany({
            where: {
                isActive: true,
                ...(region ? { region: String(region) } : {})
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json(rules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
