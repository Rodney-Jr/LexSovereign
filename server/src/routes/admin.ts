import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { GovernanceService } from '../services/GovernanceService';
import { AnalyticsService } from '../services/AnalyticsService';

const router = express.Router();

/**
 * Get tenant-wide analytics
 */
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(401).json({ error: 'Tenant context missing' });

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
        if (!tenantId) return res.status(401).json({ error: 'Tenant context missing' });

        const { name, description } = req.body;
        const dept = await GovernanceService.createDepartment(tenantId, name, description);
        res.json(dept);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
