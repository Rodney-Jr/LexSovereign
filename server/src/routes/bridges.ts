import express from 'express';
import { StorageFactory, StorageType } from '../infrastructure/adapters/StorageFactory';
import { authenticateToken, requireRole } from '../middleware/auth';
import { prisma } from '../db';

const router = express.Router();

// Default bridges to seed if none exist for a tenant
const DEFAULT_BRIDGES = [
    { name: 'Azure Entra ID', category: 'Identity', provider: 'Microsoft', status: 'Nominal', encapsulation: 'HSM Tunnel', priority: 'P0', lastActivity: null },
    { name: 'WhatsApp Cloud API', category: 'Messaging', provider: 'Meta', status: 'Nominal', encapsulation: 'DAS Proxy (Scrubbed)', priority: 'P0', lastActivity: null },
    { name: 'Sovereign Vault (Storage)', category: 'Storage', provider: 'Local/NAS', status: 'Nominal', encapsulation: 'HSM Tunnel', priority: 'P0', lastActivity: null },
];

router.get('/', authenticateToken, requireRole(['GLOBAL_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || null;

        // 1. Fetch bridges from DB for this tenant; seed defaults if none exist
        let bridges = await prisma.bridge.findMany({
            where: tenantId ? { tenantId } : { tenantId: null }
        });

        if (bridges.length === 0) {
            // Auto-seed default bridges for this tenant on first access
            const created = await Promise.all(
                DEFAULT_BRIDGES.map(b => prisma.bridge.create({
                    data: { ...b, tenantId }
                }))
            );
            bridges = created;
        }

        // 2. Live health check for Storage adapter
        const storageAdapter = StorageFactory.getAdapter(StorageType.LOCAL);
        let storageStatus = 'Nominal';
        let storageProvider = storageAdapter.providerId;
        try {
            const isHealthy = await storageAdapter.healthCheck();
            storageStatus = isHealthy ? 'Nominal' : 'Degraded';
        } catch (e) {
            storageStatus = 'Isolated';
        }

        // 3. Update Storage bridge status in DB and return
        const response = await Promise.all(bridges.map(async (b) => {
            if (b.category === 'Storage') {
                const now = new Date().toISOString();
                const updated = await prisma.bridge.update({
                    where: { id: b.id },
                    data: { status: storageStatus, provider: storageProvider, lastActivity: now }
                });
                return updated;
            }
            return b;
        }));

        res.json(response);
    } catch (err: any) {
        console.error('[Bridges] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// PATCH /:id — Update bridge status (e.g., manually mark as Degraded/Isolated)
router.patch('/:id', authenticateToken, requireRole(['GLOBAL_ADMIN', 'TENANT_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const VALID_STATUSES = ['Nominal', 'Degraded', 'Isolated'];
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
        }
        const updated = await prisma.bridge.update({
            where: { id },
            data: { status, lastActivity: new Date().toISOString() }
        });
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
