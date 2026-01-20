import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all roles (System + Tenant Specific)
router.get('/', authenticateToken as any, async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            where: {
                OR: [
                    { isSystem: true },
                    { tenantId: (req as any).user.tenantId }
                ]
            },
            include: {
                permissions: true
            }
        });
        res.json(roles);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all available permissions (Reference Data)
router.get('/permissions', authenticateToken as any, async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany();
        res.json(permissions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create a custom role
router.post('/', authenticateToken as any, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']) as any, async (req, res) => {
    try {
        const { name, description, permissionIds } = req.body;
        const tenantId = (req as any).user.tenantId;

        // Check uniqueness
        const existing = await prisma.role.findFirst({
            where: {
                name,
                OR: [{ isSystem: true }, { tenantId }]
            }
        });

        if (existing) {
            res.status(400).json({ error: 'Role name already exists' });
            return;
        }

        const role = await prisma.role.create({
            data: {
                name,
                description,
                isSystem: false,
                tenantId,
                permissions: {
                    connect: permissionIds.map((id: string) => ({ id }))
                }
            },
            include: { permissions: true }
        });

        res.json(role);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
