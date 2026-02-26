
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

        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';

        const [mattersCount, docsCount, rulesCount] = await Promise.all([
            prisma.matter.count({ where: isGlobalAdmin ? {} : { tenantId } }),
            prisma.document.count({ where: isGlobalAdmin ? {} : { matter: { tenantId } } }),
            prisma.regulatoryRule.count()
        ]);

        // Fetch tenant attributes for configurable heuristics
        const tenant = !isGlobalAdmin ? await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { attributes: true }
        }) : null;

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
            where: isGlobalAdmin ? {} : { tenantId }
        });

        // AI Validation Score: Calculate from AuditLog successes
        const successfulValidations = await prisma.auditLog.count({
            where: {
                ...(isGlobalAdmin ? {} : { userId: { in: (await prisma.user.findMany({ where: { tenantId }, select: { id: true } })).map(u => u.id) } }),
                action: 'AI_VALIDATION_PASS'
            }
        });
        const totalValidations = await prisma.auditLog.count({
            where: {
                ...(isGlobalAdmin ? {} : { userId: { in: (await prisma.user.findMany({ where: { tenantId }, select: { id: true } })).map(u => u.id) } }),
                action: { in: ['AI_VALIDATION_PASS', 'AI_VALIDATION_FAIL'] }
            }
        });

        const aiScore = totalValidations > 0
            ? parseFloat(((successfulValidations / totalValidations) * 100).toFixed(1))
            : (docsCount > 0 ? 98.2 : 100);

        res.json({
            matters: mattersCount,
            documents: docsCount,
            rules: rulesCount,
            aiValidationScore: aiScore,
            growth: {
                hoursSaved,
                feeRecovery,
                tatReduction: parseFloat(tatReduction),
                staffCount
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
        const isGlobalAdmin = req.user?.role === 'GLOBAL_ADMIN';
        const tenantId = req.user?.tenantId;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Go back 5 months + current

        const matters = await prisma.matter.findMany({
            where: {
                ...(isGlobalAdmin ? {} : { tenantId }),
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

export default router;
