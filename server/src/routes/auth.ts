import express from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 1. Atomic Onboard (New Silo + Admin)
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
        console.error(error);
        res.status(400).json({ error: error.message || 'Onboarding failed.' });
    }
});

// 2. Resolve Invite Token
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

// 3. Join Silo (Practitioner Completion)
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

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, roleName, region, tenantId } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find Role ID
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
                roleString: role.name, // Legacy
                region: region || 'GH_ACC_1',
                tenantId: tenantId || null // Should come from invite or request
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
        console.error(error);
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

// Get Me (Refresh Context)
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
