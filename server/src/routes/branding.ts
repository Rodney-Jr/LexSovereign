import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/branding-profiles
 * Returns all branding profiles for the tenant.
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(401).json({ error: 'Tenant context missing' });

        const profiles = await prisma.brandingProfile.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(profiles);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/branding-profiles
 * Creates a new branding profile.
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(401).json({ error: 'Tenant context missing' });

        const { name, logoUrl, primaryFont, headerText, footerText, coverPageEnabled, watermarkText } = req.body;

        const profile = await prisma.brandingProfile.create({
            data: {
                name,
                logoUrl,
                primaryFont,
                headerText,
                footerText,
                coverPageEnabled,
                watermarkText,
                tenantId
            }
        });

        return res.status(201).json(profile);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
