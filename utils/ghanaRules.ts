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
        pattern: /Data Protection/i,
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
        id: 'gh-stamp-duty',
        issue: 'Invalid Stamp Duty Denomination',
        statute: 'Stamp Duty Act, 2005 (Act 689)',
        fix: "Update: Specify that 'Stamp Duty' must be paid in Ghana Cedis (GHS) directly to the Ghana Revenue Authority (GRA) branch for the specified jurisdiction.",
        pattern: /Stamp Duty/i,
        negativePattern: /GHS|Ghana Cedis|GRA|Ghana Revenue Authority/i
    }
];

export const calculateStampDuty = (amount: number): number => {
    // Current GRA rate is approx 0.5% for commercial documents
    return amount * 0.005;
};
