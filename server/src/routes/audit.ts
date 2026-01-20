
import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AuditService } from '../services/auditService';

const router = express.Router();

// Get Logs (Compliance View)
router.get('/', authenticateToken as any, requireRole(['GLOBAL_ADMIN', 'TENANT_ADMIN', 'COMPLIANCE', 'DEPUTY_GC']) as any, async (req, res) => {
    try {
        const user = (req as any).user;
        const tenantId = user.role === 'GLOBAL_ADMIN' ? null : user.tenantId;

        const logs = await AuditService.getLogs(tenantId);
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
