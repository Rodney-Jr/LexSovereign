/**
 * KeywordEngine.ts
 * Maintains the canonical keyword cluster registry for the NomosDesk content automation engine.
 * Provides intent mapping, cannibalization guards, and pillar/cluster assignment.
 */

export type Intent = 'informational' | 'commercial' | 'transactional';

export interface KeywordCluster {
    id: string;
    primaryKeyword: string;
    semanticKeywords: string[];
    intent: Intent;
    pillarPage: string;
    slug: string;
    estimatedMonthlyVolume: number;
    competition: 'low' | 'medium' | 'high';
    deployed: boolean;
    deployedAt?: string;
    lastRefreshed?: string;
}

// ─── Master Keyword Registry ──────────────────────────────────────────────────
const KEYWORD_REGISTRY: KeywordCluster[] = [
    // ── Deployed (existing content) ──────────────────────────────────────────
    { id: 'kw-001', primaryKeyword: 'ai legal chatbot', semanticKeywords: ['legal intake chatbot', 'law firm ai bot', 'chatbot for law firms'], intent: 'commercial', pillarPage: '/ai-legal-chatbot', slug: '/insights/best-ai-chatbots-for-lawyers-2026', estimatedMonthlyVolume: 1900, competition: 'medium', deployed: true },
    { id: 'kw-002', primaryKeyword: 'legal practice management software', semanticKeywords: ['law practice management', 'legal case management software', 'law firm software'], intent: 'commercial', pillarPage: '/legal-practice-management-software', slug: '/insights/conflict-checking-software-law-firms', estimatedMonthlyVolume: 3400, competition: 'high', deployed: true },
    { id: 'kw-003', primaryKeyword: 'legal intake automation', semanticKeywords: ['automate client intake', 'legal intake software', 'client screening law firm'], intent: 'commercial', pillarPage: '/automated-legal-intake', slug: '/insights/how-to-automate-client-screening-law-firms', estimatedMonthlyVolume: 1200, competition: 'low', deployed: true },
    { id: 'kw-004', primaryKeyword: 'ai chatbot roi law firm', semanticKeywords: ['legal chatbot return on investment', 'chatbot benefits law firm'], intent: 'informational', pillarPage: '/ai-legal-chatbot', slug: '/insights/ai-chatbot-roi-for-law-firms', estimatedMonthlyVolume: 650, competition: 'low', deployed: true },
    { id: 'kw-005', primaryKeyword: 'government legal case management system', semanticKeywords: ['government case management software', 'ministry of justice software'], intent: 'commercial', pillarPage: '/for-government', slug: '/insights/government-legal-case-management', estimatedMonthlyVolume: 900, competition: 'low', deployed: true },

    // ── Pending (new content to generate) ────────────────────────────────────
    { id: 'kw-010', primaryKeyword: 'ai contract review software', semanticKeywords: ['contract review ai', 'automated contract analysis', 'ai contract analysis tool', 'contract review automation'], intent: 'commercial', pillarPage: '/ai-for-law-firms', slug: '/insights/ai-contract-review-software', estimatedMonthlyVolume: 1800, competition: 'medium', deployed: false },
    { id: 'kw-011', primaryKeyword: 'legal document automation', semanticKeywords: ['document automation for lawyers', 'legal drafting automation', 'automated legal documents', 'contract automation software'], intent: 'informational', pillarPage: '/legal-practice-management-software', slug: '/insights/legal-document-automation-guide', estimatedMonthlyVolume: 2200, competition: 'medium', deployed: false },
    { id: 'kw-012', primaryKeyword: 'law firm billing software', semanticKeywords: ['legal billing software', 'attorney billing software', 'law firm invoicing', 'legal time tracking'], intent: 'commercial', pillarPage: '/legal-practice-management-software', slug: '/insights/law-firm-billing-software-comparison', estimatedMonthlyVolume: 1400, competition: 'medium', deployed: false },
    { id: 'kw-013', primaryKeyword: 'ai matter management software', semanticKeywords: ['matter management system', 'legal matter tracking', 'ai case management law', 'matter management for lawyers'], intent: 'commercial', pillarPage: '/legal-practice-management-software', slug: '/insights/ai-matter-management-software', estimatedMonthlyVolume: 900, competition: 'low', deployed: false },
    { id: 'kw-014', primaryKeyword: 'legal compliance management software', semanticKeywords: ['legal compliance tool', 'compliance automation law firm', 'regulatory compliance software legal', 'compliance tracking lawyers'], intent: 'commercial', pillarPage: '/for-enterprise-legal', slug: '/insights/legal-compliance-management-software', estimatedMonthlyVolume: 1100, competition: 'low', deployed: false },
    { id: 'kw-015', primaryKeyword: 'ai for government legal departments', semanticKeywords: ['government legal ai', 'ai in public sector law', 'ministry of justice ai tools', 'government legal technology'], intent: 'informational', pillarPage: '/for-government', slug: '/insights/ai-for-government-legal-departments', estimatedMonthlyVolume: 800, competition: 'low', deployed: false },
    { id: 'kw-016', primaryKeyword: 'legal crm for law firms', semanticKeywords: ['law firm crm software', 'client relationship management law', 'crm for attorneys', 'legal client management'], intent: 'informational', pillarPage: '/law-firm-crm-software', slug: '/insights/legal-crm-for-law-firms-guide', estimatedMonthlyVolume: 1200, competition: 'medium', deployed: false },
    { id: 'kw-017', primaryKeyword: 'document management for law firms', semanticKeywords: ['legal document management system', 'law firm dms', 'legal file management software', 'document storage law firm'], intent: 'informational', pillarPage: '/legal-practice-management-software', slug: '/insights/document-management-for-law-firms', estimatedMonthlyVolume: 1600, competition: 'medium', deployed: false },

    // ── Comparison Pages ──────────────────────────────────────────────────────
    { id: 'kw-020', primaryKeyword: 'filevine alternative', semanticKeywords: ['nomosdesk vs filevine', 'filevine competitor', 'filevine replacement', 'better than filevine'], intent: 'transactional', pillarPage: '/legal-practice-management-software', slug: '/vs/nomosdesk-vs-filevine', estimatedMonthlyVolume: 2100, competition: 'low', deployed: false },
    { id: 'kw-021', primaryKeyword: 'smokeball alternative', semanticKeywords: ['nomosdesk vs smokeball', 'smokeball competitor', 'smokeball replacement', 'better than smokeball'], intent: 'transactional', pillarPage: '/legal-practice-management-software', slug: '/vs/nomosdesk-vs-smokeball', estimatedMonthlyVolume: 1300, competition: 'low', deployed: false },

    // ── Practice Area Chatbots ────────────────────────────────────────────────
    { id: 'kw-030', primaryKeyword: 'ai chatbot for employment lawyers', semanticKeywords: ['employment law chatbot', 'employment attorney ai', 'labour law intake bot'], intent: 'commercial', pillarPage: '/ai-legal-chatbot', slug: '/ai-chatbot-for-employment-lawyers', estimatedMonthlyVolume: 480, competition: 'low', deployed: false },
    { id: 'kw-031', primaryKeyword: 'ai chatbot for real estate lawyers', semanticKeywords: ['real estate law chatbot', 'property law ai bot', 'conveyancing chatbot'], intent: 'commercial', pillarPage: '/ai-legal-chatbot', slug: '/ai-chatbot-for-real-estate-lawyers', estimatedMonthlyVolume: 560, competition: 'low', deployed: false },
    { id: 'kw-032', primaryKeyword: 'ai chatbot for intellectual property lawyers', semanticKeywords: ['ip law chatbot', 'patent attorney ai', 'trademark intake bot'], intent: 'commercial', pillarPage: '/ai-legal-chatbot', slug: '/ai-chatbot-for-intellectual-property-lawyers', estimatedMonthlyVolume: 390, competition: 'low', deployed: false },

    // ── Future Pipeline ───────────────────────────────────────────────────────
    { id: 'kw-040', primaryKeyword: 'legal workflow automation software', semanticKeywords: ['law firm workflow software', 'automate legal workflows', 'workflow management for lawyers'], intent: 'commercial', pillarPage: '/legal-practice-management-software', slug: '/insights/legal-workflow-automation-software', estimatedMonthlyVolume: 1050, competition: 'low', deployed: false },
    { id: 'kw-041', primaryKeyword: 'ai legal research tools', semanticKeywords: ['ai for legal research', 'legal research automation', 'ai powered legal research'], intent: 'informational', pillarPage: '/ai-for-law-firms', slug: '/insights/ai-legal-research-tools-guide', estimatedMonthlyVolume: 2800, competition: 'high', deployed: false },
    { id: 'kw-042', primaryKeyword: 'law firm data security software', semanticKeywords: ['legal data security', 'law firm cybersecurity', 'secure legal software'], intent: 'commercial', pillarPage: '/security-and-compliance', slug: '/insights/law-firm-data-security-software', estimatedMonthlyVolume: 950, competition: 'medium', deployed: false },
    { id: 'kw-043', primaryKeyword: 'client portal for law firms', semanticKeywords: ['legal client portal', 'law firm client portal software', 'secure client portal lawyers'], intent: 'commercial', pillarPage: '/law-firm-crm-software', slug: '/insights/client-portal-for-law-firms', estimatedMonthlyVolume: 1300, competition: 'medium', deployed: false },
    { id: 'kw-044', primaryKeyword: 'e-signature for law firms', semanticKeywords: ['legal e-signature software', 'electronic signature for lawyers', 'law firm esign tool'], intent: 'commercial', pillarPage: '/legal-practice-management-software', slug: '/insights/e-signature-for-law-firms', estimatedMonthlyVolume: 1700, competition: 'medium', deployed: false },
    { id: 'kw-045', primaryKeyword: 'legal ops software solutions', semanticKeywords: ['legal operations software', 'legal ops tools', 'in-house legal ops platform'], intent: 'commercial', pillarPage: '/for-enterprise-legal', slug: '/insights/legal-ops-software-solutions', estimatedMonthlyVolume: 880, competition: 'low', deployed: false },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export class KeywordEngine {

    /** All keywords in the registry */
    static getAll(): KeywordCluster[] {
        return KEYWORD_REGISTRY;
    }

    /** Pending (not yet deployed) keywords */
    static getPending(): KeywordCluster[] {
        return KEYWORD_REGISTRY.filter(k => !k.deployed);
    }

    /** Deployed keywords */
    static getDeployed(): KeywordCluster[] {
        return KEYWORD_REGISTRY.filter(k => k.deployed);
    }

    /** Keyword stats summary */
    static getSummary() {
        const all = KEYWORD_REGISTRY;
        const deployed = all.filter(k => k.deployed);
        const pending = all.filter(k => !k.deployed);
        const totalVolume = all.reduce((s, k) => s + k.estimatedMonthlyVolume, 0);
        const pendingVolume = pending.reduce((s, k) => s + k.estimatedMonthlyVolume, 0);

        const byIntent = {
            informational: all.filter(k => k.intent === 'informational').length,
            commercial: all.filter(k => k.intent === 'commercial').length,
            transactional: all.filter(k => k.intent === 'transactional').length,
        };

        return { total: all.length, deployed: deployed.length, pending: pending.length, totalVolume, pendingVolume, byIntent };
    }

    /** Check for cannibalization: is this primary keyword already used? */
    static isCannibalized(primaryKeyword: string): boolean {
        const normalized = primaryKeyword.toLowerCase().trim();
        return KEYWORD_REGISTRY.some(k => k.primaryKeyword.toLowerCase() === normalized);
    }

    /** Get a keyword cluster by slug */
    static getBySlug(slug: string): KeywordCluster | undefined {
        return KEYWORD_REGISTRY.find(k => k.slug === slug);
    }

    /** Mark a keyword as deployed */
    static markDeployed(id: string): void {
        const kw = KEYWORD_REGISTRY.find(k => k.id === id);
        if (kw) {
            kw.deployed = true;
            kw.deployedAt = new Date().toISOString();
        }
    }

    /** Get keywords by intent */
    static getByIntent(intent: Intent): KeywordCluster[] {
        return KEYWORD_REGISTRY.filter(k => k.intent === intent);
    }

    /** Get keywords linked to a specific pillar */
    static getByPillar(pillarPage: string): KeywordCluster[] {
        return KEYWORD_REGISTRY.filter(k => k.pillarPage === pillarPage);
    }
}
