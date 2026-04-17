import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { ComplianceService } from '../services/ComplianceService';
import { AuditService } from '../services/auditService';

const router = express.Router();

/**
 * Trigger Bank-Grade Compliance Check
 */
router.post('/check', authenticateToken, async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        if (!tenantId) return res.status(400).json({ error: 'Tenant context required' });
        const { matterId, content } = req.body;
        const result = await ComplianceService.checkCompliance(tenantId, matterId, content);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Verify Audit Trail Integrity
 */
router.get('/integrity', authenticateToken, async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        if (!tenantId) return res.json({ status: 'No context', integrity: 0 });
        const result = await AuditService.verifyTenantIntegrity(tenantId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Full Audit Logs (Administrative)
 */
router.get('/logs', authenticateToken, async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        if (!tenantId) return res.json([]);
        const logs = await AuditService.getLogs(tenantId);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
