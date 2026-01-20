import express from 'express';
import { StorageFactory, StorageType } from '../infrastructure/adapters/StorageFactory';
import { IntegrationStatus, EncapsulationLevel } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Mock initial bridges but we will update their status dynamically
const BRIDGES = [
    { id: 'b1', name: 'Azure Entra ID', category: 'Identity', provider: 'Microsoft', status: 'Nominal', encapsulation: 'HSM Tunnel', priority: 'P0', lastActivity: '12s ago' },
    { id: 'b2', name: 'WhatsApp Cloud API', category: 'Messaging', provider: 'Meta', status: 'Nominal', encapsulation: 'DAS Proxy (Scrubbed)', priority: 'P0', lastActivity: '1m ago' },
    { id: 'b3', name: 'Sovereign Vault (Storage)', category: 'Storage', provider: 'Local/NAS', status: 'Nominal', encapsulation: 'HSM Tunnel', priority: 'P0', lastActivity: '45s ago' },
];

router.get('/', authenticateToken as any, requireRole(['Global Admin', 'Tenant Admin']) as any, async (req, res) => {
    // 1. Check Storage Adapter Health
    const storageAdapter = StorageFactory.getAdapter(StorageType.LOCAL);
    let storageStatus = 'Nominal';
    try {
        const isHealthy = await storageAdapter.healthCheck();
        storageStatus = isHealthy ? 'Nominal' : 'Degraded';
    } catch (e) {
        storageStatus = 'Isolated';
    }

    // 2. Map status to the response
    const response = BRIDGES.map(b => {
        if (b.category === 'Storage') {
            return { ...b, status: storageStatus, provider: storageAdapter.providerId };
        }
        return b;
    });

    res.json(response);
});

export default router;
