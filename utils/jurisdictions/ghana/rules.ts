export interface LegalHeuristic {
    id: string;
    issue: string;
    statute: string;
    fix: string;
    pattern: RegExp;
    negativePattern?: RegExp; // Flag if this pattern is MISSING
}

export const GHANA_LEGAL_HEURISTICS: LegalHeuristic[] = [
    {
        id: 'gh-dpa-843',
        issue: 'Non-compliant Data Protection Clause',
        statute: 'Data Protection Act, 2012 (Act 843) Section 20',
        fix: "Insert: 'The Processor shall comply with the Data Protection Act, 2012 (Act 843) and ensure all personal data is processed in accordance with the principles of accountability and lawfulness.'",
        pattern: /Data Protection|Personal Data/i,
        negativePattern: /Act 843/i
    },
    {
        id: 'gh-dispute-798',
        issue: 'Missing Mediation/Arbitration Priority',
        statute: 'Alternative Dispute Resolution Act, 2010 (Act 798)',
        fix: "Insert: 'Before any litigation, the parties shall first attempt to resolve the dispute through mediation or arbitration as provided under the Alternative Dispute Resolution Act, 2010 (Act 798).'",
        pattern: /Dispute Resolution|Litigation/i,
        negativePattern: /Act 798|Mediation|Arbitration/i
    },
    {
        id: 'gh-companies-992',
        issue: 'Outdated Statutory Reference (Act 179)',
        statute: 'Companies Act, 2019 (Act 992)',
        fix: "Replace 'Companies Code 1963' or 'Act 179' with 'Companies Act, 2019 (Act 992)'.",
        pattern: /Companies Code 1963|Act 179/i,
    },
    {
        id: 'gh-jurisdiction-sovereign',
        issue: 'Non-Sovereign Governing Law',
        statute: 'Constitution of the Republic of Ghana',
        fix: "Replace with: 'This Agreement shall be governed by and construed in accordance with the laws of the Republic of Ghana.'",
        pattern: /Governing Law|Laws of/i,
        negativePattern: /Republic of Ghana|Laws of Ghana/i
    },
    {
        id: 'gh-stamp-duty',
        issue: 'Invalid Stamp Duty Denomination',
        statute: 'Stamp Duty Act, 2005 (Act 689)',
        fix: "Update: Specify that 'Stamp Duty' must be paid in Ghana Cedis (GHS) directly to the Ghana Revenue Authority (GRA).",
        pattern: /Stamp Duty/i,
        negativePattern: /GHS|Ghana Cedis|GRA|Ghana Revenue Authority/i
    }
];

/**
 * Detects monetary values in contract text.
 * Returns the first detected value and currency.
 */
export const detectMonetaryValue = (text: string): { amount: number, currency: 'USD' | 'GHS' | null } => {
    const usdPattern = /\$\s?([0-9,]+(\.[0-9]{2})?)/;
    const ghsPattern = /(GHS|Cedis)\s?([0-9,]+(\.[0-9]{2})?)/i;

    const usdMatch = text.match(usdPattern);
    if (usdMatch) {
        return {
            amount: parseFloat(usdMatch[1].replace(/,/g, '')),
            currency: 'USD'
        };
    }

    const ghsMatch = text.match(ghsPattern);
    if (ghsMatch) {
        // Use full match and extract numeric parts for safety
        const cleaned = ghsMatch[0].replace(/[^0-9.]/g, '');
        const amount = parseFloat(cleaned);
        if (!isNaN(amount)) {
            return { amount, currency: 'GHS' };
        }
    }

    return { amount: 0, currency: null };
};

export const calculateStampDuty = (amount: number): number => {
    // Current GRA rate is approx 0.5% for commercial documents
    return amount * 0.005;
};
