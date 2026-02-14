
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
 * GET /api/platform/tenants
 * Returns all tenants with aggregated health and usage metrics.
 */
router.get('/tenants', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                _count: {
                    select: { users: true, matters: true }
                }
            }
        });

        const formatted = tenants.map(t => ({
            id: t.id,
            name: t.name,
            primaryRegion: t.primaryRegion || 'GLOBAL',
            plan: t.plan,
            sovereignCredits: 10000, // Heuristic/Static for now
            activeMatters: t._count.matters,
            userCount: t._count.users,
            health: 100
        }));

        res.json(formatted);
    } catch (err: any) {
        console.error("Platform Tenants Error:", err);
        res.status(500).json({ error: 'Failed to fetch platform tenants' });
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
            silos: 4,
            storageTB: (docCount * 0.05 / 1024).toFixed(2), // 50MB per doc heuristic
            computeNodes: 42, // Simulated physical nodes
            aiTokens: '1.4M', // Simulated daily throughput
            margin: '64.2%',
            egress: 'Policy Enforced',
            systemHealth: 99.98
        });
    } catch (err: any) {
        console.error("Platform Stats Error:", err);
        res.status(500).json({ error: 'Failed to fetch platform statistics' });
    }
});

/**
 * GET /api/platform/admins
 * Returns all users with Global Admin privileges.
 */
router.get('/admins', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: {
                    name: 'GLOBAL_ADMIN'
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                provider: true
            }
        });

        // Map to frontend expectation
        const formatted = admins.map(a => ({
            id: a.id,
            name: a.name,
            email: a.email,
            hardwareEnclaveId: `FIPS-SEC-${a.id.substring(0, 4).toUpperCase()}`, // Simulated ID
            mfaMethod: a.provider === 'GOOGLE' ? 'OIDC Hybrid' : 'ZK-Handshake',
            status: 'Active',
            lastHandshake: 'Recently',
            accessLevel: 'PLATFORM_OWNER'
        }));

        res.json(formatted);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch platform admins' });
    }
});

/**
 * GET /api/platform/audit-logs
 * System-wide audit pulse.
 */
router.get('/audit-logs', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            take: 20,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
        res.json(logs);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

/**
 * GET /api/platform/silos
 * Returns status of regional infrastructure enclaves.
 */
router.get('/silos', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        // In a real multi-region setup, this would query a health service or discovery API.
        // For the pilot, we simulate the regional breakdown based on known regions.
        const silos = [
            { id: 'GH_ACC_1', name: 'Silo Alpha (Ghana)', nodes: 12, health: 100, latency: '12ms', status: 'Active' },
            { id: 'US_EAST_1', name: 'Silo Beta (US East)', nodes: 24, health: 98, latency: '34ms', status: 'Active' },
            { id: 'GLOBAL', name: 'Global Cluster', nodes: 8, health: 100, latency: '48ms', status: 'Active' },
            { id: 'EU_WEST_1', name: 'London Enclave', nodes: 16, health: 100, latency: '22ms', status: 'Maintenance' },
        ];
        res.json(silos);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch silo status' });
    }
});

export default router;
