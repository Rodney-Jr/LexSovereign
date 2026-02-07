import { prisma } from '../db';

interface AuditResult {
    flagged: boolean;
    reason?: string;
    riskScore: number; // 0-100
}

export class AuditorService {

    // Core UPL Triggers (Still hard-pinned as safety defaults)
    static readonly SYSTEM_TRIGGERS = [
        "you should file",
        "i advise you to",
        "legally you must",
        "my legal opinion",
        "guaranteed outcome",
        "breach of contract confirmed"
    ];

    /**
     * Scans the provided text for regulatory violations using live RRE tokens.
     */
    static async scan(text: string, jurisdiction: string = 'GH_ACC_1'): Promise<AuditResult> {
        console.log(`[Auditor] Scanning output for jurisdiction: ${jurisdiction}`);

        const lowerText = text.toLowerCase();
        let riskScore = 0;
        let reasons: string[] = [];

        // 1. System Safety Defaults
        this.SYSTEM_TRIGGERS.forEach(trigger => {
            if (lowerText.includes(trigger)) {
                riskScore += 25;
                reasons.push(`UPL Trigger: "${trigger}"`);
            }
        });

        // 2. Dynamic Regulatory Rules from Enclave Database
        try {
            const activeRules = await prisma.regulatoryRule.findMany({
                where: { isActive: true }
            });

            for (const rule of activeRules) {
                const matchCount = rule.triggerKeywords.filter(k => lowerText.includes(k.toLowerCase())).length;

                if (matchCount > 0) {
                    const contribution = (matchCount * 15);
                    riskScore += contribution;
                    reasons.push(`Rule violation: ${rule.name} (Matched ${matchCount} keys)`);

                    // Critical Block: If rule is region-specific and context matches
                    if (rule.region === jurisdiction && riskScore >= (rule.blockThreshold * 100)) {
                        riskScore = 100;
                        reasons.push(`CRITICAL PINNED VIOLATION: ${rule.authority} enforcement.`);
                    }
                }
            }
        } catch (e) {
            console.error("[Auditor] Rule DB lookup failed, falling back to system defaults.", e);
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
