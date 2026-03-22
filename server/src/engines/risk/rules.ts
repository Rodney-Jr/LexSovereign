export type RiskSeverity = 'critical' | 'warning' | 'info';
export type RiskAction = 'fix' | 'improve' | 'insert';

export interface LegalRule {
  id: string;
  title: string;
  description: string;
  recommendation: string;
  severity: RiskSeverity;
  action: RiskAction;
  logic: (text: string) => boolean;
}

export const GHANA_LEGAL_RULES: LegalRule[] = [
  {
    id: "termination_missing_notice",
    title: "Missing termination notice period",
    description: "Detect termination clause without notice period",
    recommendation: "Insert a standard 30-day written notice period (common in Ghana contracts)",
    severity: "critical",
    action: "improve",
    logic: (text: string) => {
        const lower = text.toLowerCase();
        const hasTerminate = lower.includes('terminate');
        const hasNotice = lower.includes('days') || lower.includes('notice period');
        // Trigger if 'terminate' exists but no mention of 'days' or 'notice period'
        return hasTerminate && !hasNotice;
    }
  },
  {
    id: "missing_governing_law",
    title: "Missing governing law clause",
    description: "Detect absence of governing law clause",
    recommendation: "Specify 'This Agreement shall be governed by the laws of the Republic of Ghana'",
    severity: "critical",
    action: "insert",
    logic: (text: string) => {
        const lower = text.toLowerCase();
        const hasGovLaw = lower.includes('governing law') || lower.includes('laws of ghana') || lower.includes('laws of the republic of ghana');
        return !hasGovLaw;
    }
  },
  {
    id: "weak_indemnity",
    title: "Weak or missing indemnity clause",
    description: "Detect weak or missing indemnity clause",
    recommendation: "Include a comprehensive indemnity clause covering losses, damages, and liabilities",
    severity: "warning",
    action: "improve",
    logic: (text: string) => {
        const lower = text.toLowerCase();
        const hasIndemnify = lower.includes('indemnify') || lower.includes('indemnification');
        const wordCount = (text.match(/indemnity|indemnify/gi) || []).length;
        // Trigger if 'indemnify' not found OR clause too short (less than ~20 words around it)
        // For simplicity, checking if it doesn't exist OR if word 'indemnity/indemnify' appears but the total length is very small
        return !hasIndemnify || (hasIndemnify && text.length < 150);
    }
  },
  {
    id: "no_dispute_resolution",
    title: "No dispute resolution clause",
    description: "Detect absence of dispute resolution mechanism",
    recommendation: "Add arbitration clause (e.g., Ghana Arbitration Centre) or court jurisdiction",
    severity: "critical",
    action: "insert",
    logic: (text: string) => {
        const lower = text.toLowerCase();
        const hasDispute = lower.includes('arbitration') || lower.includes('court') || lower.includes('dispute resolution');
        return !hasDispute;
    }
  },
  {
    id: "missing_execution_block",
    title: "Missing execution block",
    description: "Detect missing signature/execution section",
    recommendation: "Include signature blocks for all parties",
    severity: "warning",
    action: "insert",
    logic: (text: string) => {
        const lower = text.toLowerCase();
        const hasSignatures = lower.includes('signed') || lower.includes('signature') || lower.includes('executed by');
        return !hasSignatures;
    }
  },
  {
    id: "ambiguous_terms",
    title: "Undefined legal terms detected",
    description: "Detect undefined capitalized terms",
    recommendation: "Add definitions section or define terms clearly",
    severity: "warning",
    action: "fix",
    logic: (text: string) => {
        // Find capitalized words not defined in 'Definitions' section
        const hasDefinitionsSection = text.toLowerCase().includes('definitions');
        if (!hasDefinitionsSection) return false; // If no section, we don't bother for now
        
        // Simple logic: if 'definitions' section exists, look for terms like "The Company" that might not be declared
        // For now, trigger if Definitions section is very brief (< 50 characters)
        const defIndex = text.toLowerCase().indexOf('definitions');
        const defSnippet = text.substring(defIndex, defIndex + 300);
        return defSnippet.length < 100;
    }
  }
];
