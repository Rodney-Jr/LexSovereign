import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/users
 * Returns all users within the current tenant enclave.
 * Restricted to TENANT_ADMIN and GLOBAL_ADMIN.
 */
router.get('/', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        if (!req.user?.tenantId) {
            res.status(400).json({ error: 'Tenant context missing' });
            return;
        }

        const users = await prisma.user.findMany({
            where: {
                tenantId: req.user.tenantId
            },
            select: {
                id: true,
                email: true,
                name: true,
                roleString: true,
                createdAt: true,
                // We don't have a 'lastActive' or 'mfaEnabled' field in the schema yet, 
                // but we can return createdAt as a proxy for now or default values.
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map to the frontend expected format if necessary
        const formattedUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.roleString,
            lastActive: 'Recently', // Placeholder
            mfaEnabled: true       // Placeholder
        }));

        res.json(formattedUsers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/users/:id
 * Removes a user from the tenant.
 * Restricted to TENANT_ADMIN and GLOBAL_ADMIN.
 */
router.delete('/:id', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const userId = req.params.id;
        const tenantId = req.user?.tenantId;

        if (!tenantId) {
            res.status(400).json({ error: 'Tenant context missing' });
            return;
        }

        // 1. Verify user exists in this tenant
        const user = await prisma.user.findFirst({
            where: { id: userId, tenantId }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found in this tenant' });
            return;
        }

        // 2. Prevent self-deletion if needed (optional check)
        if (userId === req.user?.id) {
            res.status(400).json({ error: 'You cannot remove yourself' });
            return;
        }

        // 3. Delete user
        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ success: true, message: 'User removed successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
