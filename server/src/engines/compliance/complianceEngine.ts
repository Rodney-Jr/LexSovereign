import { GHANA_BANKING_COMPLIANCE_RULES, ComplianceRule, ComplianceSeverity } from './complianceRules';

export interface ComplianceResult {
    score: number;
    status: 'compliant' | 'partially_compliant' | 'non_compliant';
    issues: any[];
}

export class ComplianceEngine {
    /**
     * Evaluate document compliance against ruleset
     */
    static async evaluate(text: string, metadata?: any): Promise<ComplianceResult> {
        const startTime = Date.now();
        const detectedIssues = [];

        // 1. Evaluate each rule
        for (const rule of GHANA_BANKING_COMPLIANCE_RULES) {
            const isPassing = rule.evaluate(text);
            if (!isPassing) {
                detectedIssues.push({
                    id: rule.id,
                    category: rule.category,
                    severity: rule.severity,
                    title: rule.title,
                    description: rule.description,
                    recommendation: rule.recommendation,
                    action: rule.action
                });
            }
        }

        // 2. Scoring Model Logic
        // Start at 100
        // Subtract 20 for each critical issue
        // Subtract 10 for each warning
        // Subtract 5 for advisory
        let score = 100;
        for (const issue of detectedIssues) {
            if (issue.severity === 'critical') score -= 20;
            else if (issue.severity === 'warning') score -= 10;
            else if (issue.severity === 'advisory') score -= 5;
        }

        score = Math.max(0, score); // Clamp at 0

        // 3. Status Mapping
        // 80-100: compliant
        // 50-79: partially_compliant
        // 0-49: non_compliant
        let status: 'compliant' | 'partially_compliant' | 'non_compliant' = 'compliant';
        if (score >= 80) status = 'compliant';
        else if (score >= 50) status = 'partially_compliant';
        else status = 'non_compliant';

        console.log(`[ComplianceEngine] Evaluation finished in ${Date.now() - startTime}ms. Score: ${score}/100`);

        return {
            score,
            status,
            issues: detectedIssues
        };
    }
}
