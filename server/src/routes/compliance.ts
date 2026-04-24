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
        const logs = await AuditService.getLogs(tenantId);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get aggregated compliance stats
 */
router.get('/stats', authenticateToken, async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        const stats = await ComplianceService.getComplianceStats(tenantId);
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all organization risks
 */
router.get('/organization-risks', authenticateToken, async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        const risks = await ComplianceService.getTenantRisks(tenantId);
        res.json(risks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update a specific risk
 */
router.patch('/risks/:id', authenticateToken, async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        const updated = await ComplianceService.updateRisk(tenantId, req.params.id, req.body);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
