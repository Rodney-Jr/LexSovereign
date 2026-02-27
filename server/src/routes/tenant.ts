import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { StripeService } from '../services/StripeService';

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

        const [userCount, matterCount, docCount, failCount] = await Promise.all([
            prisma.user.count({ where: isGlobalAdmin ? {} : { tenantId } }),
            prisma.matter.count({ where: isGlobalAdmin ? {} : { tenantId } }),
            prisma.document.count({ where: isGlobalAdmin ? {} : { matter: { tenantId } } }),
            prisma.auditLog.count({
                where: {
                    ...(isGlobalAdmin ? {} : { user: { tenantId } }),
                    action: { contains: 'FAIL' }
                }
            })
        ]);

        res.json({
            users: userCount,
            matters: matterCount,
            documents: docCount,
            siloHealth: failCount > 5 ? 'DEGRADED' : failCount > 0 ? 'WARNING' : 'NOMINAL',
            lastAudit: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/tenant/insights
// Returns operational insights for the dashboard
router.get('/insights', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(400).json({ error: 'Tenant context missing' });

        const insights = [];

        // Check for high capacity silos (simulated logic based on documents)
        const regionStats = await (prisma.document.groupBy({
            by: ['jurisdiction'],
            where: { matter: { tenantId } },
            _count: { id: true }
        }) as any);

        for (const reg of (regionStats as any[])) {
            if (reg._count?.id > 50) { // Higher threshold for documents
                insights.push({
                    level: 'CRITICAL',
                    message: `Silo ${reg.jurisdiction} is approaching storage limits (${reg._count.id} assets).`
                });
            }
        }

        // Check for unreviewed documents
        const unreviewedCount = await prisma.document.count({
            where: {
                matter: { tenantId },
                OR: [
                    { attributes: { equals: {} } },
                    { attributes: { path: ['scrubbedEntities'], equals: undefined } }
                ]
            }
        });

        if (unreviewedCount > 0) {
            insights.push({
                level: 'WARNING',
                message: `${unreviewedCount} documents pending Sovereign PII review.`
            });
        }

        // Add a stable insight if things are good
        if (insights.length === 0) {
            insights.push({
                level: 'STABLE',
                message: 'All jurisdictional silos are operating within nominal capacity bounds.'
            });
        }

        res.json(insights);
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
            select: { name: true, plan: true, subscriptionStatus: true, stripeCustomerId: true } as any
        }) as any;

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

        // Calculate AI Credits from AuditLog
        const aiUsageCount = await prisma.auditLog.count({
            where: {
                user: { tenantId },
                action: { startsWith: 'AI_ACCESS_' }
            }
        });

        // Each AI action is weighted as 10 credits by default for now
        const currentAiCredits = aiUsageCount * 10;

        // Calculate Burn Rate (Credits spent in last 24 hours / 24)
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyAiUsage = await prisma.auditLog.count({
            where: {
                user: { tenantId },
                action: { startsWith: 'AI_ACCESS_' },
                timestamp: { gte: last24h }
            }
        });
        const burnRate = (dailyAiUsage * 10 / 24).toFixed(1);

        // Storage calculation: ~10MB per document as a heuristic (0.01 GB)
        const storageUsedGB = (docCount * 0.01).toFixed(2);

        // Fetch real invoices from Stripe
        const history = tenant.stripeCustomerId
            ? await StripeService.getInvoices(tenant.stripeCustomerId)
            : [
                { id: 'draft_01', cycle: 'Current Cycle', delta: `+${docCount} Documents`, amount: `$${pricing?.basePrice || 499}`, status: 'DRAFT' }
            ];

        res.json({
            plan: tenant.plan,
            name: tenant.name,
            subscriptionStatus: tenant.subscriptionStatus || 'active',
            hasStripeCustomer: !!tenant.stripeCustomerId,
            pricing: pricing || { basePrice: 499, pricePerUser: 50, features: [], creditsIncluded: 10000 },
            usage: {
                aiCredits: { current: currentAiCredits, max: pricing?.creditsIncluded || 10000 },
                storage: { current: parseFloat(storageUsedGB), max: 50, unit: 'GB' },
                users: { current: userCount, max: pricing?.maxUsers || 100 },
                burnRate
            },
            history
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

        const tenant = await prisma.tenant.findUnique({
            where: { id: req.user?.tenantId },
            select: { separationMode: true }
        });

        res.json({
            matterPrefix: 'MAT-SOV-',
            numberingPadding: 4,
            requiredFields: ['Jurisdiction Pin', 'Client Reference'],
            separationMode: tenant?.separationMode || 'OPEN'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});


// POST /api/tenant/settings/mode
// Update Data Separation Mode
router.post('/settings/mode', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { mode } = req.body;
        const tenantId = req.user?.tenantId;

        if (!tenantId) return res.status(400).json({ error: 'Tenant context missing' });
        if (!['OPEN', 'DEPARTMENTAL', 'STRICT'].includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode. Must be OPEN, DEPARTMENTAL, or STRICT.' });
        }

        const updated = await prisma.tenant.update({
            where: { id: tenantId },
            data: { separationMode: mode }
        });

        res.json({
            separationMode: updated.separationMode,
            message: `Tenant separation mode updated to ${mode}`
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/tenant/users/:userId/department
// Assign a user to a department
router.post('/users/:userId/department', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { userId } = req.params;
        const { department } = req.body; // e.g. "INVESTIGATION"
        const tenantId = req.user?.tenantId;

        if (!tenantId) return res.status(400).json({ error: 'Tenant context missing' });

        const updated = await prisma.user.update({
            where: { id: userId, tenantId }, // Ensure user belongs to same tenant
            data: { department }
        });

        res.json({
            id: updated.id,
            department: updated.department,
            message: `User assigned to department: ${department}`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
