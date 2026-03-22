import { prisma } from '../db';
import { ComplianceEngine, ComplianceResult } from '../engines/compliance/complianceEngine';

export class ComplianceService {
    /**
     * Store and analyze compliance for a document version
     */
    static async checkCompliance(tenantId: string, matterId: string, content: string): Promise<ComplianceResult> {
        const evaluation = await ComplianceEngine.evaluate(content);

        // Audit Log
        await prisma.auditLog.create({
            data: {
                tenantId,
                matterId,
                action: 'COMPLIANCE_CHECK',
                details: `Compliance Score: ${evaluation.score}/100. Status: ${evaluation.status}. Issues: ${evaluation.issues.length}`,
                metadata: {
                    type: 'BANK_GRADE_COMPLIANCE',
                    score: evaluation.score,
                    status: evaluation.status,
                    issueIds: evaluation.issues.map((i: any) => i.id)
                }
            }
        });

        return evaluation;
    }
}
