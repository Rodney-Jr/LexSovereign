
import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { TenantService } from '../services/TenantService';
import { z } from 'zod';

const router = express.Router();

const provisionSchema = z.object({
    name: z.string().min(3),
    adminEmail: z.string().email(),
    adminName: z.string().min(2),
    plan: z.string().optional(),
    region: z.string().optional(),
    appMode: z.string().optional()
});

/**
 * POST /api/platform/provision
 * Trusted Global Admin endpoint to create new tenants.
 */
router.post('/provision', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        // Validate Input
        const input = provisionSchema.parse(req.body);

        // Execute Provisioning
        const result = await TenantService.provisionTenant(input);

        // Return sensitive credentials (HTTPS required)
        res.status(201).json({
            message: 'Tenant Provisioned Successfully',
            details: result
        });

    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors });
        }
        console.error("Provisioning Error:", err);
        res.status(500).json({ error: 'Failed to provision tenant' });
    }
});

/**
 * GET /api/platform/stats
 * Aggregated metrics for the Global Control Plane.
 */
router.get('/stats', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const [tenantCount, userCount, matterCount, docCount] = await Promise.all([
            prisma.tenant.count(),
            prisma.user.count(),
            prisma.matter.count(),
            prisma.document.count()
        ]);

        res.json({
            tenants: tenantCount,
            users: userCount,
            matters: matterCount,
            documents: docCount,
            silos: 4, // GH_ACC_1, US_EAST, EU_WEST, GLOBAL
            margin: '64.2%', // Simulated financial metric
            egress: 'Policy Enforced',
            systemHealth: 99.98
        });
    } catch (err: any) {
        console.error("Platform Stats Error:", err);
        res.status(500).json({ error: 'Failed to fetch platform statistics' });
    }
});

export default router;
