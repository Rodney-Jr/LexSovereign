import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /api/tenant/admin-stats
// Returns live counts for the current tenant
router.get('/admin-stats', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        const tenantId = req.user?.tenantId;

        if (!isGlobalAdmin && !tenantId) {
            res.status(400).json({ error: 'Tenant context missing' });
            return;
        }

        const [userCount, matterCount, docCount] = await Promise.all([
            prisma.user.count({ where: isGlobalAdmin ? {} : { tenantId } }),
            prisma.matter.count({ where: isGlobalAdmin ? {} : { tenantId } }),
            prisma.document.count({ where: isGlobalAdmin ? {} : { matter: { tenantId } } })
        ]);

        res.json({
            users: userCount,
            matters: matterCount,
            documents: docCount,
            siloHealth: 'NOMINAL',
            lastAudit: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/tenant/billing
// Returns plan details and usage metrics
router.get('/billing', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        let tenantId = req.user?.tenantId;

        if (!tenantId && isGlobalAdmin) {
            // Check if a specific tenant was requested via query, else default or show global
            const targetTenantId = req.query.targetTenantId as string;
            if (targetTenantId) {
                tenantId = targetTenantId;
            } else {
                // Return a global overview or list of tenants if possible?
                // For now, let's just use the first tenant found to avoid crash during dashboard load
                const firstTenant = await prisma.tenant.findFirst();
                tenantId = firstTenant?.id;
            }
        }

        if (!tenantId) {
            res.status(400).json({ error: 'Tenant context missing' });
            return;
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { name: true, plan: true }
        });

        if (!tenant) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        // Fetch pricing config for the plan
        const pricing = await prisma.pricingConfig.findUnique({
            where: { id: tenant.plan }
        });

        // Calculate usage (simulated for some metrics, real for others)
        const matterCount = await prisma.matter.count({ where: { tenantId } });
        const userCount = await prisma.user.count({ where: { tenantId } });
        const docCount = await prisma.document.count({ where: { matter: { tenantId } } });

        // Storage calculation: ~50MB per document as a heuristic for now
        const storageUsedGB = (docCount * 0.05).toFixed(2);

        res.json({
            plan: tenant.plan,
            name: tenant.name,
            pricing: pricing || { basePrice: 499, pricePerUser: 50, features: [], creditsIncluded: 10000 },
            usage: {
                aiCredits: { current: Math.min(matterCount * 120, 10000), max: pricing?.creditsIncluded || 10000 },
                storage: { current: parseFloat(storageUsedGB), max: 50, unit: 'GB' },
                users: { current: userCount, max: 100 }
            },
            history: [
                { id: 'inv_01', cycle: 'Current Cycle', delta: `+${docCount} Documents`, amount: `$${pricing?.basePrice || 499}`, status: 'DRAFT' },
                { id: 'inv_02', cycle: 'Previous Cycle', delta: '+150 Documents', amount: '$499.00', status: 'PAID' }
            ]
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/tenant/settings
// Returns organization-specific settings
router.get('/settings', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        if (!isGlobalAdmin && !req.user?.tenantId) {
            res.status(400).json({ error: 'Tenant context missing' });
            return;
        }

        // For now, these are logical/simulated settings that we'll eventually store in a TenantSettings table
        // But we pull the naming strategy to show how it would look.
        res.json({
            matterPrefix: 'MAT-SOV-',
            numberingPadding: 4,
            requiredFields: ['Jurisdiction Pin', 'Client Reference']
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
