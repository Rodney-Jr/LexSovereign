import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { GovernanceService } from '../services/GovernanceService';
import { AnalyticsService } from '../services/AnalyticsService';

import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { JWT_SECRET } from '../jwtConfig';

const router = express.Router();

/**
 * Support Impersonation: Assume a tenant's context
 * Only works if the tenant has an active SupportAccessGrant
 */
router.post('/support/assume', authenticateToken, async (req: any, res) => {
    try {
        if (req.user?.role !== 'GLOBAL_ADMIN') {
            return res.status(403).json({ error: 'Only platform admins can assume tenant context.' });
        }

        const { targetTenantId } = req.body;
        if (!targetTenantId) return res.status(400).json({ error: 'Target tenant ID required.' });

        // Verify active grant exists
        const grant = await (prisma as any).supportAccessGrant.findFirst({
            where: {
                tenantId: targetTenantId,
                expiresAt: { gte: new Date() },
                isActive: true
            }
        });

        if (!grant) {
            return res.status(403).json({ 
                error: 'No active support grant found for this tenant. Please ask the tenant admin to grant access from their settings.' 
            });
        }

        // Generate Impersonation Token
        // We preserve the admin's ID but switch the tenantId
        const impersonationToken = jwt.sign(
            { 
                id: req.user.id, 
                role: 'TENANT_ADMIN', // Assume power of tenant admin
                tenantId: targetTenantId,
                impersonatorId: req.user.id, // Track the original admin
                isImpersonating: true,
                email: req.user.email
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Audit the assumption
        await prisma.auditLog.create({
            data: {
                action: 'SUPPORT_ACCESS_ASSUMED',
                userId: req.user.id,
                details: `Admin ${req.user.email} assumed support context for tenant ${targetTenantId}.`,
                metadata: { targetTenantId, grantId: grant.id }
            } as any
        });

        // Set as cookie
        res.cookie('token', impersonationToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000 // 1 hour
        });

        res.json({ success: true, message: `Context switched to tenant ${targetTenantId}` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Support Impersonation: Exit context
 */
router.post('/support/exit', authenticateToken, async (req: any, res) => {
    try {
        if (!req.user?.isImpersonating) {
            return res.status(400).json({ error: 'Not currently in an impersonation session.' });
        }

        // Re-generate base Global Admin token
        const originalToken = jwt.sign(
            { 
                id: req.user.id, 
                role: 'GLOBAL_ADMIN', 
                tenantId: 'SYSTEM',
                email: req.user.email
            },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.cookie('token', originalToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 3600000
        });

        res.json({ success: true, message: 'Returned to Global Admin context.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get tenant-wide analytics
 */
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        
        if (!tenantId && !isGlobalAdmin) return res.status(403).json({ error: 'Tenant context missing' });

        // If Global Admin but no tenantId, either return platform stats or empty
        if (!tenantId) {
            return res.json({
                totalUsers: 0,
                activeTenants: 0,
                systemLoad: 'Normal'
            });
        }

        const analytics = await AnalyticsService.getTenantAnalytics(tenantId);
        res.json(analytics);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Export audit log for a matter
 */
router.get('/audit-export/:matterId', authenticateToken, async (req, res) => {
    try {
        const { matterId } = req.params;
        const exportData = await GovernanceService.exportMatterAudit(matterId);
        res.json(exportData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Manage Departments
 */
router.post('/departments', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(400).json({ error: 'Tenant context required' });

        const { name, description } = req.body;
        const dept = await GovernanceService.createDepartment(tenantId, name, description);
        res.json(dept);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
