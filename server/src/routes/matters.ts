import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all matters
router.get('/', authenticateToken as any, async (req, res) => {
    try {
        const matters = await prisma.matter.findMany({
            include: {
                tenant: true,
                internalCounsel: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        res.json(matters);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new matter
router.post('/', authenticateToken as any, async (req, res) => {
    try {
        const { name, client, type, region, internalCounselId, tenantId, description } = req.body;

        // Basic validation
        if (!name || !client || !type || !internalCounselId || !tenantId) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const matter = await prisma.matter.create({
            data: {
                name,
                client,
                type,
                status: 'OPEN', // Default
                riskLevel: 'LOW', // Default
                description: description || '',
                internalCounselId,
                tenantId,
                // region is not on Matter model directly in schema? Let's check schema.
                // Schema has: tenantId, internalCounselId, etc.
                // Wait, reviewing schema.prisma from Step 25:
                // model Matter { ... name, client, type, status, riskLevel, description, tenantId, internalCounselId ... }
                // No 'region' on Matter. It's on User/Tenant.
            }
        });

        res.json(matter);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
