import { prisma } from '../db';
import { ComplianceEngine, ComplianceResult } from '../engines/compliance/complianceEngine';

export class ComplianceService {
    /**
     * Store and analyze compliance for a document version
     */
    static async checkCompliance(tenantId: string, matterId: string, content: string): Promise<ComplianceResult> {
        const evaluation = await ComplianceEngine.evaluate(content);

        // Audit Log - Sanitize matterId to avoid Foreign Key violations (e.g. if "UNTITLED")
        const isValidMatterId = matterId && matterId.length === 36; // Simple UUID check

        await prisma.auditLog.create({
            data: {
                tenantId,
                matterId: isValidMatterId ? matterId : null,
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
}
