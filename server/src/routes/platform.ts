
import express from 'express';
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

export default router;
