import express from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../jwtConfig';
import { OIDCService } from '../services/oidcService';

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
            include: { role: { include: { permissions: true } } }
        });

        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: (user as any).role?.name,
            permissions,
            tenantId: user.tenantId
        }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name,
                tenantId: user.tenantId,
                permissions
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
            include: { role: { include: { permissions: true } } }
        });

        if (!user || !await bcrypt.compare(password, user.passwordHash)) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: (user as any)?.role?.name || 'UNKNOWN',
            permissions,
            tenantId: user.tenantId
        }, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role?.name,
                tenantId: user.tenantId,
                permissions
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
            include: { role: { include: { permissions: true } } }
        });

        if (!user) { res.sendStatus(404); return; }

        const permissions = (user as any).role?.permissions.map((p: any) => p.id) || [];
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: (user as any).role?.name,
            tenantId: user.tenantId,
            permissions
        });

    } catch (e) {
        res.sendStatus(403);
    }
});

export default router;
