export type ComplianceCategory = 'governance' | 'legal' | 'risk' | 'audit';
export type ComplianceSeverity = 'critical' | 'warning' | 'advisory';
export type ComplianceAction = 'fix' | 'review' | 'escalate';

export interface ComplianceRule {
    id: string;
    category: ComplianceCategory;
    severity: ComplianceSeverity;
    title: string;
    description: string;
    recommendation: string;
    action: ComplianceAction;
    evaluate: (text: string) => boolean;
}

export const GHANA_BANKING_COMPLIANCE_RULES: ComplianceRule[] = [
    {
        id: 'governing_law_required',
        category: 'legal',
        severity: 'critical',
        title: 'Missing Governing Law Clause',
        description: 'The agreement must explicitly state it is governed by the laws of Ghana.',
        recommendation: 'Include clause specifying the laws of the Republic of Ghana',
        action: 'fix',
        evaluate: (text) => {
            const lower = text.toLowerCase();
            return lower.includes('governing law') && (lower.includes('laws of ghana') || lower.includes('republic of ghana'));
        }
    },
    {
        id: 'authorization_clause',
        category: 'governance',
        severity: 'critical',
        title: 'Missing Authorization Clause',
        description: 'Board approval or authorized signatory language confirms proper corporate governance.',
        recommendation: 'Include clause confirming proper authorization and capacity to enter agreement',
        action: 'fix',
        evaluate: (text) => {
            const lower = text.toLowerCase();
            const keywords = ['authorized signatory', 'board approval', 'capacity', 'duly authorized', 'proper authorization'];
            return keywords.some(k => lower.includes(k));
        }
    },
    {
        id: 'counterparty_identification',
        category: 'audit',
        severity: 'critical',
        title: 'Incomplete Counterparty Identification',
        description: 'Parties must be clearly identified with legal name, registered address, and registration number.',
        recommendation: 'Ensure all parties are fully identified with legal details',
        action: 'review',
        evaluate: (text) => {
            const lower = text.toLowerCase();
            // Look for patterns like "registered office at", "company number", "registration no."
            const patterns = [/registered (office|address)/, /registration (no|number)/, /company (no|number)/];
            return patterns.some(p => p.test(lower));
        }
    },
    {
        id: 'termination_controls',
        category: 'risk',
        severity: 'critical',
        title: 'Weak Termination Controls',
        description: 'Financial institutions require clear triggers and notice periods for contract exit.',
        recommendation: 'Define termination triggers and notice period clearly',
        action: 'fix',
        evaluate: (text) => {
            const lower = text.toLowerCase();
            return lower.includes('terminate') && (lower.includes('days\' notice') || lower.includes('notice period'));
        }
    },
    {
        id: 'liability_limit',
        category: 'risk',
        severity: 'warning',
        title: 'Missing Liability Limitation',
        description: 'Caps on liability reduce direct financial exposure for the institution.',
        recommendation: 'Include liability caps to reduce financial exposure',
        action: 'fix',
        evaluate: (text) => {
            const lower = text.toLowerCase();
            return lower.includes('limitation of liability') || lower.includes('liability cap') || lower.includes('shall not exceed');
        }
    },
    {
        id: 'audit_trail_clause',
        category: 'audit',
        severity: 'warning',
        title: 'No Audit Rights Clause',
        description: 'The regulator (Bank of Ghana) requires institutions to maintain audit and inspection rights over vendors.',
        recommendation: 'Include clause allowing audit access for compliance purposes',
        action: 'fix',
        evaluate: (text) => {
            const lower = text.toLowerCase();
            return lower.includes('audit rights') || lower.includes('inspection rights') || lower.includes('right to audit');
        }
    },
    {
        id: 'data_protection',
        category: 'legal',
        severity: 'critical',
        title: 'Missing Data Protection Clause',
        description: 'Contracts must comply with the Ghana Data Protection Act (Act 843).',
        recommendation: 'Include compliance with Ghana Data Protection Act (Act 843)',
        action: 'fix',
        evaluate: (text) => {
            const lower = text.toLowerCase();
            return (lower.includes('data protection') || lower.includes('privacy')) && (lower.includes('act 843') || lower.includes('protection of personal data'));
        }
    },
    {
        id: 'dispute_resolution',
        category: 'legal',
        severity: 'critical',
        title: 'Missing Dispute Resolution Mechanism',
        description: 'A formal mechanism for resolving disputes (arbitration or court) is mandatory.',
        recommendation: 'Include arbitration or jurisdiction clause',
        action: 'fix',
        evaluate: (text) => {
            const lower = text.toLowerCase();
            const keywords = ['dispute resolution', 'arbitration', 'courts of', 'jurisdiction', 'settlement of disputes'];
            return keywords.some(k => lower.includes(k));
        }
    }
];
