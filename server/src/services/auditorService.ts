/**
 * Auditor Service (The "Red Team" Sentinel)
 * Analyzes Generative AI output for "Unauthorized Practice of Law" (UPL) triggers
 * and high-risk advice that requires human sign-off.
 */

interface AuditResult {
    flagged: boolean;
    reason?: string;
    riskScore: number; // 0-100
}

export class AuditorService {

    // Keywords determining definitive legal advice vs legal information
    // In production, this would be a specialized LLM (e.g. BERT classifier)
    static readonly UPL_TRIGGERS = [
        "you should file",
        "i advise you to",
        "legally you must",
        "my legal opinion",
        "guaranteed outcome",
        "breach of contract confirmed"
    ];

    /**
     * Scans the provided text for regulatory violations.
     */
    static async scan(text: string, jurisdiction: string = 'GH'): Promise<AuditResult> {
        console.log(`[Auditor] Scanning output for jurisdiction: ${jurisdiction}`);

        const lowerText = text.toLowerCase();
        let riskScore = 0;
        let reasons: string[] = [];

        // 1. Basic Keyword Heuristics
        this.UPL_TRIGGERS.forEach(trigger => {
            if (lowerText.includes(trigger)) {
                riskScore += 25;
                reasons.push(`Detected definitive advice trigger: "${trigger}"`);
            }
        });

        // 2. Jurisdiction Lock Check (Mock)
        // If the text references laws outside the pinned silo
        if (jurisdiction === 'GH' && (lowerText.includes('gdpr') || lowerText.includes('california penal code'))) {
            riskScore += 15;
            reasons.push("Potential cross-jurisdictional reference (Contamination Risk)");
        }

        const flagged = riskScore > 40;

        if (flagged) {
            console.warn(`[Auditor] BLOCKED content. Score: ${riskScore}. Reasons: ${reasons.join(', ')}`);
        } else {
            console.log(`[Auditor] Content CLEARED. Score: ${riskScore}`);
        }

        return {
            flagged,
            reason: reasons.length > 0 ? reasons.join(' | ') : undefined,
            riskScore
        };
    }
}
