import { prisma } from '../db';

export class AnalyticsService {
    /**
     * Get cross-matter lifecycle metrics
     */
    static async getTenantAnalytics(tenantId: string) {
        const matters = await prisma.matter.findMany({
            where: { tenantId },
            include: {
                department: true
            }
        });

        const totalMatters = matters.length;
        const byStatus = matters.reduce((acc: any, m) => {
            acc[m.status] = (acc[m.status] || 0) + 1;
            return acc;
        }, {});

        const byDepartment = matters.reduce((acc: any, m) => {
            const dept = m.department as any;
            const deptName = dept?.name || 'Unassigned';
            acc[deptName] = (acc[deptName] || 0) + 1;
            return acc;
        }, {});

        const riskDistribution = matters.reduce((acc: any, m) => {
            acc[m.riskLevel] = (acc[m.riskLevel] || 0) + 1;
            return acc;
        }, {});

        // High level metrics
        return {
            totalMatters,
            activeWorkflows: matters.filter(m => m.workflowStateId).length,
            averageComplexity: matters.length > 0 ? (matters.reduce((sum, m) => sum + (m.complexityWeight || 5.0), 0) / totalMatters).toFixed(1) : 0,
            distribution: {
                status: byStatus,
                department: byDepartment,
                risk: riskDistribution
            },
            lastUpdated: new Date()
        };
    }
}
