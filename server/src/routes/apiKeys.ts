import { Router } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// Generate a random 256-bit API key
const generateApiKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Hash the API key for secure storage (never store plain text keys)
const hashApiKey = (key: string) => {
    return crypto.createHash('sha256').update(key).digest('hex');
};

/**
 * GET /api/tenant/api-keys
 * Returns all API keys for the current tenant (excluding the raw key, only prefixes/metadata)
 */
router.get('/', authenticateToken, requireRole(['GLOBAL_ADMIN', 'TENANT_ADMIN', 'MANAGING_PARTNER']), async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(403).json({ error: 'Tenant ID missing.' });

        const keys = await prisma.apiKey.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                prefix: true,
                createdAt: true,
                lastUsed: true,
                isActive: true
            }
        });

        res.json(keys);
    } catch (err) {
        console.error('[APIKey] Fetch failed', err);
        res.status(500).json({ error: 'Failed to fetch API keys' });
    }
});

/**
 * POST /api/tenant/api-keys
 * Creates a new API key and returns the raw key ONCE.
 */
router.post('/', authenticateToken, requireRole(['GLOBAL_ADMIN', 'TENANT_ADMIN', 'MANAGING_PARTNER']), async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const { name } = req.body;

        if (!tenantId) return res.status(403).json({ error: 'Tenant ID missing.' });
        if (!name?.trim()) return res.status(400).json({ error: 'Key name is required.' });

        const rawKey = `sk_local_${generateApiKey()}`;
        const keyHash = hashApiKey(rawKey);
        const prefix = rawKey.substring(0, 12) + '...';

        const newKey = await prisma.apiKey.create({
            data: {
                name: name.trim(),
                keyHash,
                prefix,
                tenantId
            }
        });

        // We only return rawKey here. It is never retrievable again.
        res.status(201).json({
            ...newKey,
            rawKey
        });
    } catch (err) {
        console.error('[APIKey] Creation failed', err);
        res.status(500).json({ error: 'Failed to create API key' });
    }
});

/**
 * DELETE /api/tenant/api-keys/:id
 * Revokes/Deletes an API Key
 */
router.delete('/:id', authenticateToken, requireRole(['GLOBAL_ADMIN', 'TENANT_ADMIN', 'MANAGING_PARTNER']), async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const { id } = req.params;

        if (!tenantId) return res.status(403).json({ error: 'Tenant ID missing.' });

        // Ensure key belongs to tenant
        const key = await prisma.apiKey.findUnique({ where: { id } });
        if (!key || key.tenantId !== tenantId) {
            return res.status(404).json({ error: 'Key not found.' });
        }

        await prisma.apiKey.delete({
            where: { id }
        });

        res.json({ success: true, message: 'API key revoked.' });
    } catch (err) {
        console.error('[APIKey] Deletion failed', err);
        res.status(500).json({ error: 'Failed to revoke API key' });
    }
});

export default router;
