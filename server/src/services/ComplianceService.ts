import { prisma } from '../db';
import { ComplianceEngine, ComplianceResult } from '../engines/compliance/complianceEngine';
import { AuditService } from './auditService';

export class ComplianceService {
    /**
     * Store and analyze compliance for a document version
     */
    static async checkCompliance(tenantId: string, matterId: string, content: string): Promise<ComplianceResult> {
        const evaluation = await ComplianceEngine.evaluate(content);
        const isValidMatterId = matterId && matterId.length === 36;

        await AuditService.log(
            'COMPLIANCE_CHECK',
            null, // System action, no specific user in this context
            tenantId,
            isValidMatterId ? matterId : null,
            {
                type: 'BANK_GRADE_COMPLIANCE',
                score: evaluation.score,
                status: evaluation.status,
                issueCount: evaluation.issues.length
            }
        );

        return evaluation;
    }

    /**
     * Deep analysis for binary or text files
     */
    static async analyzeFile(fileBuffer: Buffer, fileName: string, mimetype: string, region: string) {
        // For now, assume we can convert buffer to text or it's already text-like
        const text = fileBuffer.toString('utf8');
        const evaluation = await ComplianceEngine.evaluate(text);

        return {
            complianceScore: evaluation.score,
            piiCount: 0, // Mock for now
            riskLevel: evaluation.status === 'compliant' ? 'LOW' : evaluation.status === 'partially_compliant' ? 'MEDIUM' : 'HIGH',
            issues: evaluation.issues
        };
    }

    /**
     * Deep analysis for document drafts
     */
    static async analyzeDocument(content: string, region: string) {
        const evaluation = await ComplianceEngine.evaluate(content);

        return {
            complianceScore: evaluation.score,
            piiCount: 0, // Mock for now
            riskLevel: evaluation.status === 'compliant' ? 'LOW' : evaluation.status === 'partially_compliant' ? 'MEDIUM' : 'HIGH',
            issues: evaluation.issues
        };
    }

    /**
     * Fetch all risks for a tenant
     */
    static async getTenantRisks(tenantId: string) {
        return await prisma.predictiveRisk.findMany({
            where: { tenantId },
            include: {
                matter: {
                    select: { name: true }
                }
            },
            orderBy: { probability: 'desc' }
        });
    }

    /**
     * Get aggregated compliance stats for a tenant
     */
    static async getComplianceStats(tenantId: string) {
        const [totalRisks, highRisks, mitigatedRisks, totalMatters] = await Promise.all([
            prisma.predictiveRisk.count({ where: { tenantId } }),
            prisma.predictiveRisk.count({ 
                where: { 
                    tenantId, 
                    OR: [{ impact: 'High' }, { impact: 'Critical' }] 
                } 
            }),
            prisma.predictiveRisk.count({ 
                where: { tenantId, status: 'MITIGATED' } 
            }),
            prisma.matter.count({ where: { tenantId } })
        ]);

        // Heuristic health score: heavily penalize critical risks
        const penalty = highRisks * 15;
        const healthScore = Math.max(0, Math.min(100, 100 - penalty));

        return {
            totalRisks,
            highRisks,
            mitigatedRisks,
            totalMatters,
            healthScore
        };
    }

    /**
     * Update risk mitigation plan and status
     */
    static async updateRisk(tenantId: string, riskId: string, data: any) {
        return await prisma.predictiveRisk.update({
            where: { id: riskId, tenantId },
            data: {
                mitigationPlan: data.mitigationPlan,
                status: data.status,
                riskCategory: data.riskCategory
            }
        });
    }
}
