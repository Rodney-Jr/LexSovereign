import express, { Request, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// ─── GET /clauses ─────────────────────────────────────────────────────────────
// Lists all clauses accessible to the tenant (global + tenant-specific).
// Supports optional query params: ?search=, ?category=, ?tags=
router.get('/', async (req: any, res: Response) => {
    try {
        const tenantId = req.user?.tenantId === '__PLATFORM__' ? null : req.user?.tenantId;
        const { search, category, tags } = req.query as Record<string, string>;

        const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

        const clauses = await prisma.clause.findMany({
            where: {
                AND: [
                    // Multi-tenant isolation: global OR belonging to this tenant
                    { OR: [{ isGlobal: true }, { tenantId: tenantId ?? undefined }] },
                    // Optional search: title or category contains the search term
                    search ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { category: { contains: search, mode: 'insensitive' } },
                        ]
                    } : {},
                    // Optional category filter
                    category ? { category: { equals: category, mode: 'insensitive' } } : {},
                    // Optional tags filter (clause must have ALL specified tags)
                    tagList.length > 0 ? { tags: { hasEvery: tagList } } : {},
                ]
            },
            select: {
                id: true,
                title: true,
                category: true,
                jurisdiction: true,
                tags: true,
                usageCount: true,
                isGlobal: true,
                updatedAt: true,
            },
            orderBy: [{ usageCount: 'desc' }, { title: 'asc' }]
        });

        res.json(clauses);
    } catch (error: any) {
        console.error('[Clauses] GET / error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /clauses/:id ─────────────────────────────────────────────────────────
router.get('/:id', async (req: any, res: Response) => {
    try {
        const tenantId = req.user?.tenantId === '__PLATFORM__' ? null : req.user?.tenantId;
        const clause = await prisma.clause.findUnique({ where: { id: req.params.id } });

        if (!clause) return res.status(404).json({ error: 'Clause not found' });
        if (!clause.isGlobal && clause.tenantId && clause.tenantId !== tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Increment usage count for analytics (non-blocking)
        prisma.clause.update({
            where: { id: clause.id },
            data: { usageCount: { increment: 1 } }
        }).catch(() => { /* silent — analytics only */ });

        res.json(clause);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ─── POST /clauses ─────────────────────────────────────────────────────────────
router.post('/', async (req: any, res: Response) => {
    try {
        const tenantId = req.user?.tenantId === '__PLATFORM__' ? null : req.user?.tenantId;
        const isGlobalAdmin = req.user?.roleString === 'GLOBAL_ADMIN';
        const { title, category, jurisdiction, content, tags, isGlobal } = req.body;

        // Only global admins can create global (platform-level) clauses
        const resolvedIsGlobal = isGlobal === true && isGlobalAdmin;

        const clause = await prisma.clause.create({
            data: {
                title,
                category,
                jurisdiction: jurisdiction || 'GH_ACC_1',
                content,
                tags: tags || [],
                isGlobal: resolvedIsGlobal,
                tenantId: resolvedIsGlobal ? null : tenantId,
            }
        });

        res.status(201).json(clause);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ─── PUT /clauses/:id ─────────────────────────────────────────────────────────
router.put('/:id', async (req: any, res: Response) => {
    try {
        const tenantId = req.user?.tenantId === '__PLATFORM__' ? null : req.user?.tenantId;
        const isGlobalAdmin = req.user?.roleString === 'GLOBAL_ADMIN';

        const existing = await prisma.clause.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ error: 'Clause not found' });
        if (!isGlobalAdmin && existing.tenantId !== tenantId) {
            return res.status(403).json({ error: 'Access denied: Cannot modify this clause' });
        }

        const { title, category, jurisdiction, content, tags } = req.body;
        const updated = await prisma.clause.update({
            where: { id: req.params.id },
            data: { title, category, jurisdiction, content, tags }
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ─── DELETE /clauses/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req: any, res: Response) => {
    try {
        const tenantId = req.user?.tenantId === '__PLATFORM__' ? null : req.user?.tenantId;
        const isGlobalAdmin = req.user?.roleString === 'GLOBAL_ADMIN';

        const existing = await prisma.clause.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ error: 'Clause not found' });
        if (!isGlobalAdmin && existing.tenantId !== tenantId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await prisma.clause.delete({ where: { id: req.params.id } });
        res.json({ message: 'Clause removed from library' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
