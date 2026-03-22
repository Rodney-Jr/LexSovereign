import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { ComplianceService } from '../services/ComplianceService';

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

export default router;
