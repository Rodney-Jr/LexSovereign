import express from 'express';
import { prisma } from '../db';
import { StripeService } from '../services/StripeService';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/users
 * Returns all users within the current tenant enclave.
 * Restricted to TENANT_ADMIN and GLOBAL_ADMIN.
 */
router.get('/', authenticateToken, requireRole(['TENANT_ADMIN', 'GLOBAL_ADMIN']), async (req, res) => {
    try {
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        if (!isGlobalAdmin && !req.user?.tenantId) {
            res.status(400).json({ error: 'Tenant context missing' });
            return;
        }

        const users = await prisma.user.findMany({
            where: isGlobalAdmin ? {} : {
                tenantId: req.user!.tenantId
            },
            select: {
                id: true,
                email: true,
                name: true,
                roleString: true,
                createdAt: true,
                maxWeeklyHours: true,
                roleSeniority: true,
                jurisdictionPins: true,
                credentials: true
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
            mfaEnabled: true,       // Placeholder
            maxWeeklyHours: u.maxWeeklyHours,
            roleSeniority: u.roleSeniority,
            jurisdictionPins: u.jurisdictionPins as string[],
            credentials: u.credentials as any[]
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

        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';

        if (!isGlobalAdmin && !tenantId) {
            res.status(400).json({ error: 'Tenant context missing' });
            return;
        }

        // 1. Verify user exists 
        const user = await prisma.user.findFirst({
            where: isGlobalAdmin ? { id: userId } : { id: userId, tenantId }
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

        // 4. Sync Stripe seats
        if (user.tenantId) {
            const tenant = await prisma.tenant.findUnique({
                where: { id: user.tenantId },
                select: { stripeSubscriptionId: true }
            });

            if (tenant?.stripeSubscriptionId) {
                StripeService.syncSubscriptionQuantity(user.tenantId).catch(err =>
                    console.error(`[Stripe Sync Error] ${err.message}`)
                );
            }
        }

        res.json({ success: true, message: 'User removed successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
