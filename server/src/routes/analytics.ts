
// [RE-BUILD TRIGGER] - Corrected Prisma model reference from regulation to regulatoryRule
import express from 'express';
import { prisma } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/analytics/metrics
// Returns aggregated counts for key entities
router.get('/metrics', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const isGlobalAdmin = !tenantId;

        // Global Admin: platform-wide counts; Tenant user: scoped counts
        const tenantFilter = isGlobalAdmin ? {} : { tenantId: tenantId as string };
        const matterTenantFilter = isGlobalAdmin ? {} : { matter: { tenantId: tenantId as string } };

        const [mattersCount, docsCount, rulesCount] = await Promise.all([
            prisma.matter.count({ where: tenantFilter }),
            prisma.document.count({ where: matterTenantFilter }),
            prisma.regulatoryRule.count()
        ]);

        // Fetch tenant attributes for configurable heuristics (platform admin gets defaults)
        const tenant = tenantId ? await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { attributes: true }
        }) : null;

        const attributes = (tenant?.attributes as any) || {};
        const hoursPerMatter = attributes.hoursPerMatter ?? 10;
        const hoursPerDoc = attributes.hoursPerDoc ?? 0.5;
        const feePerMatter = attributes.feePerMatter ?? 5000;

        const hoursSaved = (mattersCount * hoursPerMatter) + (docsCount * hoursPerDoc);
        const feeRecovery = mattersCount * feePerMatter;
        const tatReduction = Math.min(40 + (docsCount * 0.1), 75).toFixed(1);

        const staffCount = await prisma.user.count({ where: tenantFilter });

        const userIds = (await prisma.user.findMany({ where: tenantFilter, select: { id: true } })).map(u => u.id);
        const [successfulValidations, totalValidations] = await Promise.all([
            prisma.auditLog.count({ where: { userId: { in: userIds }, action: 'AI_VALIDATION_PASS' } }),
            prisma.auditLog.count({ where: { userId: { in: userIds }, action: { in: ['AI_VALIDATION_PASS', 'AI_VALIDATION_FAIL'] } } })
        ]);

        const aiScore = totalValidations > 0
            ? parseFloat(((successfulValidations / totalValidations) * 100).toFixed(1))
            : 0;

        res.json({
            matters: mattersCount,
            documents: docsCount,
            rules: rulesCount,
            aiValidationScore: aiScore,
            growth: {
                hoursSaved,
                feeRecovery,
                tatReduction: parseFloat(tatReduction),
                staffCount,
                partnerRate: attributes.partnerRate ?? 5625
            }
        });
    } catch (error: any) {
        console.error("[Analytics] Metrics failed:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/analytics/history
// Returns matter creation history for the last 6 months
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

        const tenantFilter = tenantId ? { tenantId, createdAt: { gte: sixMonthsAgo } } : { createdAt: { gte: sixMonthsAgo } };

        const matters = await prisma.matter.findMany({
            where: tenantFilter,
            select: { createdAt: true }
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();

        // Initialize last 6 months with 0
        const historyMap = new Map<string, number>();
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(currentMonth - i);
            const key = months[d.getMonth()]!;
            historyMap.set(key, 0);
        }

        // Aggregate counts
        matters.forEach(m => {
            const key = months[new Date(m.createdAt).getMonth()]!;
            if (historyMap.has(key)) {
                historyMap.set(key, (historyMap.get(key) || 0) + 1);
            }
        });

        const data = Array.from(historyMap.entries()).map(([name, value]) => ({ name, value }));

        return res.json(data);
    } catch (error: any) {
        console.error("[Analytics] History failed:", error);
        return res.status(500).json({ error: error.message });
    }
});

// GET /api/analytics/clm/stats
// Returns CLM-specific metrics: active contracts, cycle time, and risk exposure
router.get('/clm/stats', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.json({
                activeContracts: 0,
                avgCycleTime: '0d',
                riskHeatmap: { highLiability: 0, nonStandardIndemnity: 0, autoRenewal: 0, jurisdictionMismatch: 0 }
            });
        }

        const [activeContractsCount, closedMatters, riskAnalyses] = await Promise.all([
            prisma.contractMetadata.count({
                where: { matter: { tenantId: tenantId as string } }
            }),
            prisma.matter.findMany({
                where: {
                    tenantId: tenantId as string,
                    status: 'CLOSED',
                    updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
                },
                select: { createdAt: true, updatedAt: true }
            }),
            prisma.predictiveRisk.findMany({
                where: { matter: { tenantId: tenantId as string } },
                select: { type: true }
            })
        ]);

        // Calculate Average Cycle Time in Days
        let avgCycleTime = "0";
        if (closedMatters.length > 0) {
            const totalTime = closedMatters.reduce((acc, m) => {
                return acc + (m.updatedAt.getTime() - m.createdAt.getTime());
            }, 0);
            avgCycleTime = (totalTime / closedMatters.length / (1000 * 60 * 60 * 24)).toFixed(1);
        }

        // Aggregate Risk Exposure
        const riskHeatmap = {
            highLiability: riskAnalyses.filter(r => r.type === 'HIGH_LIABILITY').length,
            nonStandardIndemnity: riskAnalyses.filter(r => r.type === 'NON_STANDARD_INDEMNITY').length,
            autoRenewal: riskAnalyses.filter(r => r.type === 'AUTO_RENEWAL').length,
            jurisdictionMismatch: riskAnalyses.filter(r => r.type === 'JURISDICTION_MISMATCH').length
        };

        res.json({
            activeContracts: activeContractsCount,
            avgCycleTime: `${avgCycleTime}d`,
            riskHeatmap
        });
    } catch (error: any) {
        console.error("[Analytics] CLM Stats failed:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/analytics/case-center
// Returns counts for Case Center Dashboard
router.get('/case-center', authenticateToken, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.json({
                activeCases: 0,
                complianceRate: '100%',
                proceduralDistribution: []
            });
        }

        const matterFilter = { tenantId };

        const [matters, deadlines] = await Promise.all([
            prisma.matter.findMany({
                where: matterFilter,
                select: { status: true, id: true }
            }),
            prisma.deadline.findMany({
                where: { matter: { tenantId } }
            })
        ]);

        const activeCases = matters.length;

        // Compliance Rate (deadlines)
        const totalDeadlines = deadlines.length;
        const missedDeadlines = deadlines.filter(d =>
            new Date(d.dueDate) < new Date() && d.status === 'PENDING'
        ).length;
        const complianceRate = totalDeadlines > 0
            ? Math.round(((totalDeadlines - missedDeadlines) / totalDeadlines) * 100) + '%'
            : '100%';

        // Procedural Distribution
        let pDistribution = { pleadings: 0, discovery: 0, trialPrep: 0, advisory: 0 };
        matters.forEach(m => {
            if (m.status === 'OPEN') pDistribution.discovery++;
            else if (m.status === 'PENDING') pDistribution.pleadings++;
            else if (m.status === 'CLOSED') pDistribution.trialPrep++;
            else pDistribution.advisory++;
        });

        res.json({
            activeCases,
            complianceRate,
            proceduralDistribution: [
                { label: 'Pleadings / Service', count: pDistribution.pleadings, color: 'bg-sky-500' },
                { label: 'Discovery Phase', count: pDistribution.discovery, color: 'bg-purple-500' },
                { label: 'Trial Prep', count: pDistribution.trialPrep, color: 'bg-rose-500' },
                { label: 'Advisory / Research', count: pDistribution.advisory, color: 'bg-emerald-500' }
            ]
        });

    } catch (error: any) {
        console.error("[Analytics] Case Center Stats failed:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
