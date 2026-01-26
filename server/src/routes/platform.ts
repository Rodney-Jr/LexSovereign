import express from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Provision New Tenant (Bypasses SaaS checkout)
// Security: GLOBAL_ADMIN role only
router.post('/provision-tenant', authenticateToken as any, authorizeRole(['GLOBAL_ADMIN']) as any, async (req, res) => {
    const { name, plan, appMode, primaryRegion, adminEmail, adminPassword } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Tenant
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    plan: plan || 'STANDARD',
                    appMode: appMode || 'LAW_FIRM',
                    primaryRegion: primaryRegion || 'GH_ACC_1'
                }
            });

            // 2. Fetch appropriate role for the new admin (System-level TENANT_ADMIN)
            const role = await tx.role.findUnique({
                where: { name: 'TENANT_ADMIN' }
            });

            if (!role) throw new Error("TENANT_ADMIN system role not found. Run seeds.");

            // 3. Create First User (Admin)
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const user = await tx.user.create({
                data: {
                    email: adminEmail,
                    passwordHash: hashedPassword,
                    name: `${name} Admin`,
                    roleId: role.id,
                    roleString: 'TENANT_ADMIN',
                    tenantId: tenant.id,
                    region: primaryRegion || 'GH_ACC_1'
                }
            });

            return { tenant, userEmail: user.email };
        });

        res.status(201).json({
            message: "Tenant provisioned successfully",
            tenant: result.tenant,
            adminEmail: result.userEmail
        });

    } catch (error: any) {
        console.error("[Platform] Provisioning Failed:", error);
        res.status(400).json({ error: error.message || "Manual provisioning failed." });
    }
});

// List all tenants (Telemetry)
router.get('/tenants', authenticateToken as any, authorizeRole(['GLOBAL_ADMIN']) as any, async (req, res) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                _count: {
                    select: { users: true, matters: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to metadata format expected by frontend
        const mapped = tenants.map(t => ({
            id: t.id,
            name: t.name,
            plan: t.plan,
            primaryRegion: t.primaryRegion,
            activeMatters: t._count.matters,
            userCount: t._count.users,
            createdAt: t.createdAt
        }));

        res.json(mapped);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
