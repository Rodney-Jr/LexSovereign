
import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Middleware to ensure user has COMPLIANCE or TENANT_ADMIN role
const ensureComplianceAccess = (req: any, res: Response, next: any) => {
    const role = req.user?.role;
    if (role === UserRole.TENANT_ADMIN || role === UserRole.COMPLIANCE || role === UserRole.GLOBAL_ADMIN) {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Compliance overview requires elevated regional privileges." });
    }
};

// GET /api/compliance/stats - Organizational compliance statistics
router.get('/stats', authenticateToken as any, ensureComplianceAccess, async (req: any, res: Response) => {
    const tenantId = req.user.tenantId;

    try {
        const [totalRisks, highRisks, mitigatedRisks] = await Promise.all([
            prisma.predictiveRisk.count({
                where: { matter: { tenantId } }
            }),
            prisma.predictiveRisk.count({
                where: {
                    matter: { tenantId },
                    impact: { in: ['High', 'Critical'] }
                }
            }),
            prisma.predictiveRisk.count({
                where: {
                    matter: { tenantId },
                    status: 'MITIGATED'
                }
            })
        ]);

        const totalMatters = await prisma.matter.count({ where: { tenantId } });

        res.json({
            totalRisks,
            highRisks,
            mitigatedRisks,
            totalMatters,
            healthScore: totalRisks > 0 ? Math.round(((mitigatedRisks) / totalRisks) * 100) : 100
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/compliance/organization-risks - Aggregated risks for the tenant
router.get('/organization-risks', authenticateToken as any, ensureComplianceAccess, async (req: any, res: Response) => {
    const tenantId = req.user.tenantId;

    try {
        const risks = await prisma.predictiveRisk.findMany({
            where: { matter: { tenantId } },
            include: {
                matter: {
                    select: {
                        name: true,
                        client: true,
                        internalCounsel: true
                    }
                }
            },
            orderBy: { probability: 'desc' }
        });
        res.json(risks);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// PATCH /api/compliance/risks/:id - Update risk assessment or mitigation
router.patch('/risks/:id', authenticateToken as any, ensureComplianceAccess, async (req: any, res: Response) => {
    const { id } = req.params;
    const { mitigationPlan, status, riskCategory } = req.body;
    const tenantId = req.user.tenantId;

    try {
        // Verify ownership
        const risk = await prisma.predictiveRisk.findFirst({
            where: { id, matter: { tenantId } }
        });

        if (!risk) return res.status(404).json({ error: "Risk vector not found in this silo." });

        const updated = await prisma.predictiveRisk.update({
            where: { id },
            data: { mitigationPlan, status, riskCategory }
        });

        res.json(updated);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
