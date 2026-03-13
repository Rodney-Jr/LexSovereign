import { DocumentParserService } from './DocumentParserService';

export interface ComplianceResult {
    complianceScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    piiCount: number;
    issues: string[];
}

export class ComplianceService {
    /**
     * Extracts text from a file buffer and analyzes it against jurisdictional heuristics.
     */
    static async analyzeFile(buffer: Buffer, filename: string, mimeType?: string, jurisdiction = 'GHANA'): Promise<ComplianceResult> {
        try {
            const extractedText = await DocumentParserService.parse(buffer, filename, mimeType);
            return this.analyzeDocument(extractedText, jurisdiction);
        } catch (error) {
            console.error(`[ComplianceService] Failed to analyze file ${filename}:`, error);
            // Return safe fallback if parsing fails
            return {
                complianceScore: 50,
                riskLevel: 'MEDIUM',
                piiCount: 0,
                issues: ['Failed to extract text for automated compliance scanning.']
            };
        }
    }

    /**
     * Analyzes plain text for compliance risks based on the jurisdiction.
     */
    static analyzeDocument(text: string, jurisdiction = 'GHANA'): ComplianceResult {
        if (!text || text.trim() === '') {
            return { complianceScore: 100, riskLevel: 'LOW', piiCount: 0, issues: [] };
        }

        const issues: string[] = [];
        let scorePenalty = 0;
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        
        // Basic PII estimation (Emails, simple phone patterns, SSN-like patterns)
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
        
        const emails = text.match(emailRegex) || [];
        const phones = text.match(phoneRegex) || [];
        const piiCount = emails.length + phones.length;

        if (piiCount > 5) {
            issues.push(`High volume of PII detected (${piiCount} instances). Ensure GDPR/Data Protection Act compliance.`);
            scorePenalty += 10;
            riskLevel = piiCount > 20 ? 'HIGH' : 'MEDIUM';
        }

        const upperText = text.toUpperCase();

        if (jurisdiction.toUpperCase() === 'GHANA' || jurisdiction.toUpperCase() === 'GH') {
            // 1. Governing Law Mismatch
            if (upperText.includes('ENGLAND AND WALES') || upperText.includes('LAWS OF THE STATE OF NEW YORK')) {
                issues.push('Foreign Governing Law Detected: Contract asserts foreign jurisdiction while operating in Ghana Silo.');
                scorePenalty += 25;
                riskLevel = 'HIGH';
            }

            // 2. Missing Dispute Resolution (Arbitration Act 2020)
            if (!upperText.includes('ARBITRATION') && !upperText.includes('MEDIATION') && upperText.includes('COURT')) {
                issues.push('Missing ADR Clause: Consider adding Alternative Dispute Resolution provisions.');
                scorePenalty += 10;
                if (riskLevel !== 'HIGH') riskLevel = 'MEDIUM';
            }

            // 3. Stamp Duty Indicators
            if (upperText.includes('SHARE PURCHASE') || (upperText.includes('CONSIDERATION') && upperText.includes('GH₵'))) {
                issues.push('Stamp Duty Trigger: Document likely requires filing with GRA under Stamp Duty Act.');
            }
        }

        const finalScore = Math.max(0, 100 - scorePenalty);

        return {
            complianceScore: finalScore,
            riskLevel: riskLevel,
            piiCount: piiCount,
            issues: issues
        };
    }
}
