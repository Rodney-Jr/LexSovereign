import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { AuditService } from '../services/auditService';

const router = express.Router();

// GET all clients for the tenant
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userTenantId = req.user?.tenantId;
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';

        if (!userTenantId && !isGlobalAdmin) return res.status(400).json({ error: 'Missing tenant context' });

        const clients = await prisma.client.findMany({
            where: isGlobalAdmin ? {} : { tenantId: userTenantId as string },
            include: {
                _count: { select: { matters: true } },
                matters: {
                    select: {
                        id: true, name: true, status: true, type: true,
                        billingComponents: { select: { type: true, fixedAmount: true } },
                        invoices: { select: { status: true, totalAmount: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(clients);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const userTenantId = req.user?.tenantId;
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';

        if (!userTenantId && !isGlobalAdmin) return res.status(401).json({ error: 'Authentication required' });

        const whereClause: any = { id: req.params.id };
        if (!isGlobalAdmin) {
            whereClause.tenantId = userTenantId;
        }

        const client = await prisma.client.findFirst({
            where: whereClause,
            include: {
                matters: {
                    include: {
                        invoices: true,
                        billingComponents: true,
                        internalCounsel: { select: { name: true, id: true } }
                    }
                }
            }
        });
        if (!client) return res.status(404).json({ error: 'Client not found' });
        res.json(client);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST create a new client
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userTenantId = req.user?.tenantId;
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';

        if (!userTenantId && !isGlobalAdmin) return res.status(400).json({ error: 'Missing tenant context' });

        const { name, industry, contactEmail, contactPhone, billingAddress, taxId, type } = req.body;

        if (!name) return res.status(400).json({ error: 'Client name is required' });

        // Admins can provision clients for specific tenants if they provide targetTenantId
        const targetTenantId = userTenantId || req.body.targetTenantId;
        if (!targetTenantId) return res.status(400).json({ error: 'targetTenantId is required for creation' });

        // Check for duplicate within target tenant
        const existing = await prisma.client.findFirst({ where: { name, tenantId: targetTenantId } });
        if (existing) return res.status(409).json({ error: `A client named "${name}" already exists` });

        const client = await prisma.client.create({
            data: { name, tenantId: targetTenantId, industry, contactEmail, contactPhone, billingAddress, taxId, type: type || 'CORPORATE' }
        });

        await AuditService.log('CREATE_CLIENT', req.user?.id || null, client.id, `Client "${name}" added to directory`);
        res.status(201).json(client);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH update a client
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(401).json({ error: 'Authentication required' });
        const { name, industry, contactEmail, contactPhone, billingAddress, taxId, type } = req.body;

        const existing = await prisma.client.findFirst({ where: { id: req.params.id, tenantId } });
        if (!existing) return res.status(404).json({ error: 'Client not found' });

        const updated = await prisma.client.update({
            where: { id: req.params.id },
            data: { name, industry, contactEmail, contactPhone, billingAddress, taxId, type }
        });

        await AuditService.log('UPDATE_CLIENT', req.user?.id || null, updated.id, `Client "${updated.name}" updated`);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a client (only if no matters linked)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(401).json({ error: 'Authentication required' });

        const client = await prisma.client.findFirst({
            where: { id: req.params.id, tenantId },
            include: { _count: { select: { matters: true } } }
        });
        if (!client) return res.status(404).json({ error: 'Client not found' });
        
        const clientWithCount = client as any;
        if (clientWithCount._count.matters > 0) {
            return res.status(409).json({ error: `Cannot delete "${client.name}" — it has ${clientWithCount._count.matters} active matter(s). Reassign them first.` });
        }

        await prisma.client.delete({ where: { id: req.params.id } });
        await AuditService.log('DELETE_CLIENT', req.user?.id || null, req.params.id, `Client "${client.name}" removed from directory`);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
