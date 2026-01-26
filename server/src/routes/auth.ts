import express from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import crypto from 'crypto';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// 1. Atomic Onboard (New Silo + Admin) - PUBLIC
router.post('/onboard-silo', async (req, res) => {
    const { name, plan, appMode, region, adminEmail, adminPassword } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Create Tenant
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    plan: plan || 'STANDARD',
                    appMode: appMode || 'LAW_FIRM',
                    primaryRegion: region || 'GH_ACC_1'
                }
            });

            // Admin Role
            const role = await tx.role.findUnique({ where: { name: 'TENANT_ADMIN' } });
            if (!role) throw new Error("Seed roles missing.");

            // Primary Admin User
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const user = await tx.user.create({
                data: {
                    email: adminEmail,
                    passwordHash: hashedPassword,
                    name: `${name} Administrator`,
                    roleId: role.id,
                    roleString: 'TENANT_ADMIN',
                    tenantId: tenant.id,
                    region: region || 'GH_ACC_1'
                },
                include: { role: { include: { permissions: true } }, tenant: true }
            });

            return { user, tenant };
        });

        const permissions = result.user.role?.permissions.map(p => p.id) || [];
        const token = jwt.sign({
            id: result.user.id,
            email: result.user.email,
            role: result.user.role?.name,
            permissions,
            tenantId: result.user.tenantId,
            appMode: result.tenant.appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        res.status(201).json({
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role?.name,
                tenantId: result.user.tenantId,
                permissions,
                mode: result.tenant.appMode
            }
        });

    } catch (error: any) {
        console.error(`[Auth] Onboarding Failed: ${error.message}`);

        // Handle Prisma Unique Constraint Violation
        if (error.code === 'P2002') {
            const target = error.meta?.target || ['email'];
            res.status(400).json({
                error: `An account with this ${target.includes('email') ? 'email' : 'name'} already exists.`,
                code: 'CONFLICT'
            });
            return;
        }

        res.status(400).json({ error: error.message || 'Onboarding failed.' });
    }
});

// 2. Resolve Invite Token - PUBLIC
router.post('/resolve-invite', async (req, res) => {
    try {
        const { token } = req.body;
        const invitation = await prisma.invitation.findUnique({
            where: { token, isUsed: false },
            include: { tenant: true }
        });

        if (!invitation || invitation.expiresAt < new Date()) {
            res.status(404).json({ error: 'Invalid or expired invitation' });
            return;
        }

        res.json({
            email: invitation.email,
            roleName: invitation.roleName,
            tenantName: invitation.tenant.name,
            tenantMode: invitation.tenant.appMode
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Join Silo (Practitioner Completion) - PUBLIC
router.post('/join-silo', async (req, res) => {
    const { token, name, password } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const invitation = await tx.invitation.findUnique({
                where: { token, isUsed: false },
                include: { tenant: true }
            });

            if (!invitation) throw new Error("Invite resolution failed.");

            const role = await tx.role.findFirst({
                where: { name: invitation.roleName, OR: [{ isSystem: true }, { tenantId: invitation.tenantId }] }
            });

            if (!role) throw new Error("Target role not found.");

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await tx.user.create({
                data: {
                    email: invitation.email,
                    name,
                    passwordHash: hashedPassword,
                    roleId: role.id,
                    roleString: role.name,
                    tenantId: invitation.tenantId,
                    region: invitation.tenant.primaryRegion
                },
                include: { role: { include: { permissions: true } }, tenant: true }
            });

            await tx.invitation.update({
                where: { id: invitation.id },
                data: { isUsed: true }
            });

            return { user, tenant: invitation.tenant };
        });

        const permissions = result.user.role?.permissions.map(p => p.id) || [];
        const jwtToken = jwt.sign({
            id: result.user.id,
            email: result.user.email,
            role: result.user.role?.name,
            permissions,
            tenantId: result.user.tenantId,
            appMode: result.tenant.appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token: jwtToken,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role?.name,
                tenantId: result.user.tenantId,
                permissions,
                mode: result.tenant.appMode
            }
        });

    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 4. Generate Invitation - PROTECTED
router.post('/invite', authenticateToken as any, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']) as any, async (req, res) => {
    try {
        const { email, roleName } = req.body;
        const tenantId = (req as any).user.tenantId;

        if (!tenantId) {
            res.status(400).json({ error: 'Tenant context missing' });
            return;
        }

        const token = `SOV-INV-${crypto.randomUUID().split('-')[0].toUpperCase()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        const invitation = await prisma.invitation.create({
            data: {
                token,
                email,
                roleName: roleName || 'INTERNAL_COUNSEL',
                tenantId,
                expiresAt
            }
        });

        res.json({ token, expiresAt: invitation.expiresAt });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Register - Standard
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, roleName, region, tenantId } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const role = await prisma.role.findFirst({
            where: { name: roleName || 'INTERNAL_COUNSEL', OR: [{ isSystem: true }, { tenantId }] }
        });

        if (!role) {
            res.status(400).json({ error: 'Invalid Role' });
            return;
        }

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name,
                roleId: role.id,
                roleString: role.name,
                region: region || 'GH_ACC_1',
                tenantId: tenantId || null
            },
            include: {
                role: { include: { permissions: true } },
                tenant: true
            }
        });

        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        const appMode = (user as any).tenant?.appMode || 'LAW_FIRM';

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: (user as any).role?.name,
            permissions,
            tenantId: user.tenantId,
            appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name,
                tenantId: user.tenantId,
                permissions,
                mode: appMode
            }
        });
    } catch (error: any) {
        res.status(400).json({ error: 'User already exists or invalid data' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: { include: { permissions: true } },
                tenant: true
            }
        });

        if (!user || !await bcrypt.compare(password, user.passwordHash)) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        const appMode = (user as any).tenant?.appMode || 'LAW_FIRM';

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: (user as any)?.role?.name || 'UNKNOWN',
            permissions,
            tenantId: user.tenantId,
            appMode
        }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name,
                tenantId: user.tenantId,
                permissions,
                mode: appMode
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get Me
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) { res.sendStatus(401); return; }

        const decoded: any = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                role: { include: { permissions: true } },
                tenant: true
            }
        });

        if (!user) { res.sendStatus(404); return; }

        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        const appMode = (user as any).tenant?.appMode || 'LAW_FIRM';

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: (user as any).role?.name,
            tenantId: user.tenantId,
            permissions,
            mode: appMode
        });

    } catch (e) {
        res.sendStatus(403);
    }
});

export default router;
