/**
 * PII Sanitization Service ("DAS" Engine)
 * Data Access Service that scrubs sensitive information before LLM inference.
 */

// Regex patterns for common jurisdictional/Legal entities
const PATTERNS: Record<string, RegExp> = {
    // GH-PostGPS (e.g., GA-183-8164)
    DIGITAL_ADDRESS: /\b[A-Z]{2}-\d{3}-\d{4}\b/g,
    // National ID Card (e.g., ID-123456789-0)
    NATIONAL_ID: /\b[A-Z]{3}-\d{9}-\d\b/g,
    // Nigerian NIN (11 digits)
    NG_NIN: /\b\d{11}\b/g,
    // Kenyan ID (7 to 8 digits)
    KE_ID: /\b\d{7,8}\b/g,
    // LASRRA (Lagos) IDs (LA- + 8-10 digits)
    LASRRA_ID: /\bLA-\d{8,10}\b/g,
    // Emails
    EMAIL: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    // Phone Numbers (Standard formats)
    PHONE: /\b(\+\d{1,3}|0)[0-9]{9,10}\b/g,
    // Currency (Base unit 1,000.00)
    CURRENCY: /\b[A-Z]{3}\s?[\d,]+(\.\d{2})?\b/g
};

export class PiiService {

    /**
     * Sanitizes text by replacing PII with deterministic tokens.
     * Returns both the sanitized text and a map to detokenize later if needed.
     */
    static async sanitize(text: string, jurisdiction: string = 'GH'): Promise<{ sanitized: string; entityMap: Map<string, string> }> {
        let sanitized = text;
        const entityMap = new Map<string, string>();

        // 1. Pass 1: Lean LLM Name Scrubbing (Experimental)
        try {
            const names = await this.scrubNamesLean(text);
            names.forEach((name, index) => {
                const token = `[PERSON_${index + 1}]`;
                const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                sanitized = sanitized.replace(new RegExp(safeName, 'g'), token);
                entityMap.set(token, name);
            });
        } catch (e) {
            console.error("[DAS Engine] Lean Name Scrubbing failed, falling back to regex pass.", e);
        }

        // Helper to replace and store
        const replace = (pattern: RegExp, type: string) => {
            let count = 1;
            pattern.lastIndex = 0;
            const uniqueMatches = new Set(sanitized.match(pattern) || []);

            uniqueMatches.forEach(original => {
                const token = `[${type}_${count++}]`;
                const safeOriginal = String(original).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                sanitized = sanitized.replace(new RegExp(safeOriginal, 'g'), token);
                entityMap.set(token, String(original));
            });
        };

        // Jurisdictional toggles
        replace(PATTERNS.DIGITAL_ADDRESS, 'GEO_LOC');
        replace(PATTERNS.EMAIL, 'CONTACT_EMAIL');
        replace(PATTERNS.PHONE, 'CONTACT_PHONE');
        replace(PATTERNS.CURRENCY, 'MONETARY_VAL');

        if (jurisdiction === 'GH') replace(PATTERNS.NATIONAL_ID, 'GOV_ID');
        if (jurisdiction === 'NG') {
            replace(PATTERNS.NG_NIN, 'NG_NIN');
            replace(PATTERNS.LASRRA_ID, 'LASRRA');
        }
        if (jurisdiction === 'KE') replace(PATTERNS.KE_ID, 'KE_ID');

        console.log(`[DAS Engine] Sanitized ${entityMap.size} unique PII entities.`);
        return { sanitized, entityMap };
    }

    /**
     * Lightweight helper to identify names/firms via secondary LLM.
     */
    private static async scrubNamesLean(text: string): Promise<string[]> {
        const apiKey = process.env.SECONDARY_LLM_API_KEY;
        const endpoint = process.env.SECONDARY_LLM_ENDPOINT || "https://api.openai.com/v1/chat/completions";
        const model = process.env.SECONDARY_LLM_MODEL || "gpt-4o-mini";

        if (!apiKey) return [];

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: 'Identify all human names and law firm names in the text. Return a JSON array of strings only. [] if none.' },
                        { role: 'user', content: text }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            const data: any = await response.json();
            const content = JSON.parse(data.choices[0].message.content);
            return Array.isArray(content) ? content : (content.names || []);
        } catch (e) {
            console.warn("[DAS Engine] Lean LLM call failed:", e);
            return [];
        }
    }

    /**
     * Restore original PII into the text using the entity map.
     * (Optional: mostly we want the LLM output to NOT contain PII, 
     * but sometimes we need to restore context for the UI).
     */
    static desanitize(text: string, entityMap: Map<string, string>): string {
        let restored = text;
        entityMap.forEach((original, token) => {
            // Escape the token for regex (brackets)
            const safeToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            restored = restored.replace(new RegExp(safeToken, 'g'), original);
        });
        return restored;
    }
}
