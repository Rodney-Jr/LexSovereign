import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { ComplianceService } from '../services/ComplianceService';
import { AuditService } from '../services/AuditService';

const router = express.Router();

/**
 * Trigger Bank-Grade Compliance Check
 */
router.post('/check', authenticateToken, async (req: any, res) => {
    try {
        const { matterId, content } = req.body;
        const result = await ComplianceService.checkCompliance(req.user.tenantId, matterId, content);
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
        const result = await AuditService.verifyTenantIntegrity(req.user.tenantId);
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
        const logs = await AuditService.getLogs(req.user.tenantId);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
