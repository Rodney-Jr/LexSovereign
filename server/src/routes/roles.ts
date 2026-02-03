import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all roles (System + Tenant Specific)
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const roles = await prisma.role.findMany({
            where: {
                OR: [
                    { isSystem: true },
                    { tenantId: req.user.tenantId }
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
router.get('/permissions', authenticateToken, async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany();
        res.json(permissions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create a custom role
router.post('/', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { name, description, permissionIds } = req.body;

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const tenantId = req.user.tenantId;

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

// Get available templates (Discovery)
router.get('/templates', authenticateToken, async (req, res) => {
    try {
        const list = Object.keys(INDUSTRY_TEMPLATES).map(key => {
            const templateRoles = INDUSTRY_TEMPLATES[key];
            if (!templateRoles) return null;
            return {
                id: key,
                name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                roleCount: templateRoles.length,
                roles: templateRoles.map(r => ({
                    name: r.name,
                    description: r.description,
                    permissionCount: r.permissions.length
                }))
            };
        }).filter(Boolean);
        return res.json(list);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// Apply Industry Template
router.post('/templates/:type', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { type } = req.params;

        if (!req.user || !type) {
            return res.status(401).json({ error: 'Unauthorized or Missing Type' });
        }

        const tenantId = req.user.tenantId;

        const template = INDUSTRY_TEMPLATES[type.toUpperCase()];
        if (!template) {
            return res.status(400).json({ error: `Invalid template type. Available: ${Object.keys(INDUSTRY_TEMPLATES).join(', ')}` });
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

        return res.json({ message: 'Template applied successfully', results });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

// Update a role
router.put('/:id', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissionIds } = req.body;

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const tenantId = req.user.tenantId;

        // Verify ownership and system status
        const role = await prisma.role.findFirst({
            where: { id, tenantId }
        });

        if (!role) {
            res.status(404).json({ error: 'Role not found or access denied' });
            return;
        }

        if (role.isSystem) {
            res.status(403).json({ error: 'Cannot modify system roles' });
            return;
        }

        const updated = await prisma.role.update({
            where: { id },
            data: {
                name,
                description,
                permissions: {
                    set: permissionIds.map((pid: string) => ({ id: pid }))
                }
            },
            include: { permissions: true }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a role
router.delete('/:id', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const tenantId = req.user.tenantId;

        const role = await prisma.role.findFirst({
            where: { id, tenantId }
        });

        if (!role) {
            res.status(404).json({ error: 'Role not found' });
            return;
        }

        if (role.isSystem) {
            res.status(403).json({ error: 'Cannot delete system roles' });
            return;
        }

        // Check if users are assigned? (Optional safety)

        await prisma.role.delete({ where: { id } });
        res.json({ message: 'Role deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
