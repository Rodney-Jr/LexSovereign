import { GHANA_LEGAL_RULES, LegalRule, RiskSeverity, RiskAction } from './rules';

export interface DocumentRisk {
  id: string;
  severity: RiskSeverity;
  title: string;
  description: string;
  recommendation: string;
  action: RiskAction;
  target?: string;
}

export class LegalRiskEngine {
  /**
   * Evaluator - Main entry point
   * Fast, deterministic rule-based analysis
   */
  static async evaluate(documentText: string, structuredDocument?: any): Promise<DocumentRisk[]> {
    const start = Date.now();
    const risks: DocumentRisk[] = [];

    // 1. Normalize (lowercase doesn't mutate, just helps matching)
    // For now, simplicity: checking rules on raw input for flexibility
    const normalizedText = documentText.trim();

    // 2. Match Rules
    for (const rule of GHANA_LEGAL_RULES) {
       const isMatched = rule.logic(normalizedText);

       if (isMatched) {
         risks.push({
           id: rule.id,
           severity: rule.severity,
           title: rule.title,
           description: rule.description,
           recommendation: rule.recommendation,
           action: rule.action,
         });
       }
    }

    // 3. Sort by severity (critical -> warning -> info)
    const severityMap: Record<RiskSeverity, number> = {
      critical: 0,
      warning: 1,
      info: 2
    };

    const sortedRisks = risks.sort((a, b) => severityMap[a.severity] - severityMap[b.severity]);
    
    const end = Date.now();
    console.log(`[RiskEngine] Analysis completed in ${end - start}ms. Found ${sortedRisks.length} risks.`);

    return sortedRisks;
  }
}
