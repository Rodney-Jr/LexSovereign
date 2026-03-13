
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

        const [mattersCount, docsCount, rulesCount] = await Promise.all([
            prisma.matter.count({ where: { tenantId } }),
            prisma.document.count({ where: { matter: { tenantId } } }),
            prisma.regulatoryRule.count()
        ]);

        // Fetch tenant attributes for configurable heuristics
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { attributes: true }
        });

        const attributes = (tenant?.attributes as any) || {};
        const hoursPerMatter = attributes.hoursPerMatter ?? 10;
        const hoursPerDoc = attributes.hoursPerDoc ?? 0.5;
        const feePerMatter = attributes.feePerMatter ?? 5000;

        // Growth Metrics Heuristics
        // Default: 10h per matter + 0.5h per document
        const hoursSaved = (mattersCount * hoursPerMatter) + (docsCount * hoursPerDoc);

        // Fee Recovery: Default Approx 5000 GHS per matter
        const feeRecovery = mattersCount * feePerMatter;

        // TAT Reduction: Base 40% + scaling with volume up to 75%
        const tatReduction = Math.min(40 + (docsCount * 0.1), 75).toFixed(1);

        // staffCount: Pull from users in tenant
        const staffCount = await prisma.user.count({
            where: { tenantId }
        });

        // AI Validation Score: Calculate from AuditLog successes
        const successfulValidations = await prisma.auditLog.count({
            where: {
                userId: { in: (await prisma.user.findMany({ where: { tenantId }, select: { id: true } })).map(u => u.id) },
                action: 'AI_VALIDATION_PASS'
            }
        });
        const totalValidations = await prisma.auditLog.count({
            where: {
                userId: { in: (await prisma.user.findMany({ where: { tenantId }, select: { id: true } })).map(u => u.id) },
                action: { in: ['AI_VALIDATION_PASS', 'AI_VALIDATION_FAIL'] }
            }
        });

        const aiScore = totalValidations > 0
            ? parseFloat(((successfulValidations / totalValidations) * 100).toFixed(1))
            : 0; // No validations recorded yet

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
        // Fallback for missing tables or other DB errors
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
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Go back 5 months + current

        const matters = await prisma.matter.findMany({
            where: {
                tenantId,
                createdAt: { gte: sixMonthsAgo }
            },
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
        if (!tenantId) return res.status(401).json({ error: 'Unauthorized' });

        const [activeContractsCount, closedMatters, riskAnalyses] = await Promise.all([
            prisma.contractMetadata.count({
                where: { matter: { tenantId } }
            }),
            prisma.matter.findMany({
                where: {
                    tenantId,
                    status: 'CLOSED',
                    updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
                },
                select: { createdAt: true, updatedAt: true }
            }),
            prisma.predictiveRisk.findMany({
                where: { matter: { tenantId } },
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

        const [matters, deadlines] = await Promise.all([
            prisma.matter.findMany({
                where: { tenantId },
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
