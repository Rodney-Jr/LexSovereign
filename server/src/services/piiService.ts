/**
 * PII Sanitization Service ("DAS" Engine)
 * Data Access Service that scrubs sensitive information before LLM inference.
 */

// Regex patterns for common Ghana/Legal entities
const PATTERNS = {
    // GH-PostGPS (e.g., GA-183-8164)
    DIGITAL_ADDRESS: /\b[A-Z]{2}-\d{3}-\d{4}\b/g,
    // Ghana Card (e.g., GHA-123456789-0)
    GHANA_CARD: /\bGHA-\d{9}-\d\b/g,
    // Emails
    EMAIL: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    // Phone Numbers (Ghana formats)
    PHONE: /\b(\+233|0)[235][0-9]{8}\b/g,
    // Currency (GHS 1,000.00)
    CURRENCY: /\bGHS\s?[\d,]+(\.\d{2})?\b/g
};

export class PiiService {

    /**
     * Sanitizes text by replacing PII with deterministic tokens.
     * Returns both the sanitized text and a map to detokenize later if needed.
     */
    static sanitize(text: string): { sanitized: string; entityMap: Map<string, string> } {
        let sanitized = text;
        const entityMap = new Map<string, string>();

        // Helper to replace and store
        const replace = (pattern: RegExp, type: string) => {
            let match;
            let count = 1;
            // Reset regex lastIndex if global
            pattern.lastIndex = 0;

            // We need to loop or use replace with callback to capture unique values
            // Ideally we want consistent replacement: same value -> same token
            const uniqueMatches = new Set(text.match(pattern) || []);

            uniqueMatches.forEach(original => {
                const token = `[${type}_${count++}]`;
                // Global replace of this specific string
                // Escape regex special chars in the original string
                const safeOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                sanitized = sanitized.replace(new RegExp(safeOriginal, 'g'), token);
                entityMap.set(token, original);
            });
        };

        replace(PATTERNS.DIGITAL_ADDRESS, 'GEO_LOC');
        replace(PATTERNS.GHANA_CARD, 'GOV_ID');
        replace(PATTERNS.EMAIL, 'CONTACT_EMAIL');
        replace(PATTERNS.PHONE, 'CONTACT_PHONE');
        replace(PATTERNS.CURRENCY, 'MONETARY_VAL');

        console.log(`[DAS Engine] Sanitized ${entityMap.size} unique PII entities.`);
        return { sanitized, entityMap };
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
