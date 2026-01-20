import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { PolicyEngine } from '../services/policyEngine';

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


// Update a matter (With Policy Check)
router.put('/:id', authenticateToken as any, async (req, res) => {
    try {
        const { id } = req.params;
        const { riskLevel, status, ...rest } = req.body;
        const user = (req as any).user;

        // 1. Fetch current matter state
        const currentMatter = await prisma.matter.findUnique({ where: { id } });
        if (!currentMatter) {
            return res.status(404).json({ error: 'Matter not found' });
        }

        // 2. Policy Check: High Risk Updates
        if (riskLevel === 'HIGH' || currentMatter.riskLevel === 'HIGH') {
            const policyResult = await PolicyEngine.evaluate(
                user.userId,
                user.attributes || {},
                'MATTER',
                { ...currentMatter, riskLevel },
                'UPDATE_HIGH_RISK',
                user.tenantId
            );

            if (!policyResult.allowed) {
                return res.status(403).json({
                    error: `Policy Restriction: ${policyResult.reason || 'High Risk Matters require elevated approval.'}`
                });
            }
        }

        // 3. Dual Approval for Closing
        if (status === 'CLOSED' && currentMatter.status !== 'CLOSED') {
            // Example: Require User Role to be 'TENANT_ADMIN' or 'DEPUTY_GC' explicitly?
            // Or rely on PolicyEngine 'CLOSE_MATTER' action.
            const closePolicy = await PolicyEngine.evaluate(
                user.userId,
                user.attributes || {},
                'MATTER',
                currentMatter,
                'CLOSE_MATTER',
                user.tenantId
            );
            if (!closePolicy.allowed) {
                return res.status(403).json({ error: 'Closure denied. Requires Partner/GC approval.' });
            }
        }

        const updated = await prisma.matter.update({
            where: { id },
            data: {
                riskLevel,
                status,
                ...rest
            }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
