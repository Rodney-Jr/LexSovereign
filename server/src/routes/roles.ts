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
                isSystem: false, // Custom role
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

import { INDUSTRY_TEMPLATES } from '../config/templates';

// Apply Industry Template
router.post('/templates/:type', authenticateToken as any, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']) as any, async (req, res) => {
    try {
        const { type } = req.params;
        const tenantId = (req as any).user.tenantId;

        const template = INDUSTRY_TEMPLATES[type.toUpperCase()];
        if (!template) {
            res.status(400).json({ error: 'Invalid template type. Available: LAW_FIRM, BANKING, INSURANCE, SME_LEGAL' });
            return;
        }

        const results = [];
        for (const roleDef of template) {
            // Check if role exists for this tenant
            const existing = await prisma.role.findFirst({
                where: {
                    name: roleDef.name,
                    tenantId
                }
            });

            if (existing) {
                // Skip or Update? Let's skip to preserve custom changes.
                results.push({ name: roleDef.name, status: 'SKIPPED_EXISTS' });
                continue;
            }

            // Verify permissions exist (strict check)
            // In a real app we might want to just connect valid ones, but let's try to connect all
            const validPermissions = await prisma.permission.findMany({
                where: { id: { in: roleDef.permissions } },
                select: { id: true }
            });

            await prisma.role.create({
                data: {
                    name: roleDef.name,
                    description: roleDef.description,
                    isSystem: false,
                    tenantId,
                    permissions: {
                        connect: validPermissions.map(p => ({ id: p.id }))
                    }
                }
            });
            results.push({ name: roleDef.name, status: 'CREATED', permissionCount: validPermissions.length });
        }

        res.json({ message: 'Template applied successfully', results });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
