import express, { Request, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// List templates (Global + Tenant-Specific)
router.get('/', authenticateToken as any, async (req: any, res: Response) => {
    try {
        let tenantId = req.user?.tenantId;
        if (tenantId === '__PLATFORM__') tenantId = null;
        console.log(`[Templates-Debug] User: ${req.user?.email} | Tenant: ${tenantId}`);
        const templates = await prisma.documentTemplate.findMany({
            where: {
                OR: [
                    { tenantId: null },
                    { tenantId: tenantId }
                ]
            },
            select: {
                id: true,
                name: true,
                description: true,
                category: true,
                jurisdiction: true,
                version: true,
                structure: true,
                tenantId: true
            },
            orderBy: { category: 'asc' }
        });
        console.log(`[Templates-Debug] Found ${templates.length} templates`);
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create/Upload a new template
router.post('/', authenticateToken as any, async (req: any, res: Response) => {
    try {
        let tenantId = req.user?.tenantId;
        console.log(`[Templates-Upload-Debug] User: ${req.user?.email} | Role: ${req.user?.role} | TenantID: ${tenantId}`);

        if (tenantId === '__PLATFORM__') tenantId = null;

        // Ensure user has permission or is Global Admin
        const hasUploadPermission = req.user?.permissions?.includes('manage_tenant') || 
                                   req.user?.roleString === 'GLOBAL_ADMIN' ||
                                   req.user?.role === 'GLOBAL_ADMIN';

        if (!hasUploadPermission) {
            return res.status(403).json({ error: 'Permission denied: Cannot manage blueprints' });
        }

        const { name, description, category, jurisdiction, content, version, structure } = req.body;

        const template = await prisma.documentTemplate.create({
            data: {
                name,
                description,
                category,
                jurisdiction,
                content,
                version: version || '1.0.0',
                structure: structure || {},
                tenantId
            }
        });

        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a template
router.delete('/:id', authenticateToken as any, async (req: any, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;
        const { id } = req.params;

        const template = await prisma.documentTemplate.findUnique({
            where: { id }
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        if (template.tenantId !== tenantId) {
            return res.status(403).json({ error: 'Access denied: Cannot delete global or foreign templates' });
        }

        await prisma.documentTemplate.delete({
            where: { id }
        });

        res.json({ message: 'Template removed from silo' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific template content
router.get('/:id', authenticateToken as any, async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const tenantId = req.user?.tenantId;

        const template = await prisma.documentTemplate.findUnique({
            where: { id }
        });

        if (!template || (template.tenantId && template.tenantId !== tenantId)) {
            res.status(404).json({ error: 'Template not found or access denied' });
            return;
        }

        res.json(template);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
