/**
 * InternalLinkingEngine.ts
 * Maintains a link graph of all marketing site pages.
 * For each new article, returns a set of recommended internal links:
 *  - 1 pillar page link (mandatory)
 *  - 2–3 related cluster articles
 * Generates keyword-rich anchor text tuned to avoid over-optimization.
 */

export interface InternalLink {
    href: string;
    anchorText: string;
    reason: string; // 'pillar' | 'cluster' | 'conversion'
}

// ── Link Graph: all existing pages ───────────────────────────────────────────
const LINK_GRAPH: Array<{ slug: string; title: string; keywords: string[]; type: 'pillar' | 'insight' | 'comparison' | 'chatbot' | 'core' }> = [
    // Pillars
    { slug: '/legal-practice-management-software', title: 'Legal Practice Management Software', keywords: ['legal practice management', 'law practice software', 'case management', 'matter management'], type: 'pillar' },
    { slug: '/ai-for-law-firms', title: 'AI for Law Firms', keywords: ['ai for lawyers', 'legal ai', 'artificial intelligence law', 'ai law firm software'], type: 'pillar' },
    { slug: '/law-firm-crm-software', title: 'Law Firm CRM Software', keywords: ['legal crm', 'law firm crm', 'client management', 'legal client relationship'], type: 'pillar' },
    { slug: '/automated-legal-intake', title: 'Automated Legal Intake', keywords: ['legal intake', 'client intake automation', 'intake software', 'intake forms'], type: 'pillar' },
    { slug: '/ai-legal-chatbot', title: 'AI Legal Chatbot', keywords: ['ai chatbot', 'legal chatbot', 'law firm chatbot', 'intake chatbot'], type: 'pillar' },
    // Core
    { slug: '/security-and-compliance', title: 'Security & Compliance', keywords: ['legal data security', 'data sovereignty', 'enclave security', 'compliance'], type: 'core' },
    { slug: '/for-law-firms', title: 'For Law Firms', keywords: ['law firm software', 'law firm platform'], type: 'core' },
    { slug: '/for-enterprise-legal', title: 'For Enterprise Legal', keywords: ['enterprise legal software', 'in-house legal', 'corporate legal'], type: 'core' },
    { slug: '/for-government', title: 'For Government', keywords: ['government legal software', 'ministry of justice', 'public sector legal'], type: 'core' },
    { slug: '/pricing', title: 'Pricing', keywords: ['pricing', 'plans', 'cost'], type: 'core' },
    // Insights
    { slug: '/insights/conflict-checking-software-law-firms', title: 'Conflict Checking Software', keywords: ['conflict check', 'conflict of interest', 'conflict software'], type: 'insight' },
    { slug: '/insights/government-legal-case-management', title: 'Government Legal Case Management', keywords: ['government case management', 'judicial case management', 'ministry case system'], type: 'insight' },
    { slug: '/insights/sovereign-legal-data-infrastructure', title: 'Sovereign Legal Data Infrastructure', keywords: ['data sovereignty', 'sovereign legal data', 'legal data infrastructure'], type: 'insight' },
    { slug: '/insights/data-sovereignty-compliance-africa', title: 'Data Sovereignty Compliance in Africa', keywords: ['data sovereignty africa', 'legal compliance africa', 'gdpr africa'], type: 'insight' },
    { slug: '/insights/best-ai-chatbots-for-lawyers-2026', title: 'Best AI Chatbots for Lawyers 2026', keywords: ['best legal chatbots', 'top law firm chatbots', 'legal chatbot comparison'], type: 'insight' },
    { slug: '/insights/ai-chatbot-roi-for-law-firms', title: 'AI Chatbot ROI for Law Firms', keywords: ['chatbot roi', 'chatbot return on investment', 'chatbot revenue'], type: 'insight' },
    { slug: '/insights/how-ai-chatbots-increase-law-firm-revenue', title: 'How AI Chatbots Increase Revenue', keywords: ['chatbot revenue', 'chatbot conversions', 'chatbot leads law firm'], type: 'insight' },
    { slug: '/insights/ai-vs-live-chat-for-legal-intake', title: 'AI vs Live Chat for Legal Intake', keywords: ['ai vs live chat', 'chatbot vs human', 'ai intake comparison'], type: 'insight' },
    { slug: '/insights/legal-intake-automation-for-small-law-firms', title: 'Legal Intake Automation for Small Law Firms', keywords: ['small law firm intake', 'solo firm intake', 'boutique law firm automation'], type: 'insight' },
    { slug: '/insights/enterprise-ai-intake-for-corporate-legal', title: 'Enterprise AI Intake for Corporate Legal', keywords: ['enterprise legal intake', 'corporate intake automation', 'in-house intake'], type: 'insight' },
    { slug: '/insights/how-government-agencies-use-ai-chatbots', title: 'How Government Agencies Use AI Chatbots', keywords: ['government chatbot', 'public sector chatbot', 'agency ai'], type: 'insight' },
    { slug: '/insights/legal-crm-conversion-optimization', title: 'Legal CRM Conversion Optimization', keywords: ['crm conversion', 'legal lead conversion', 'crm optimization law'], type: 'insight' },
    { slug: '/insights/why-generic-crms-fail-law-firms', title: 'Why Generic CRMs Fail Law Firms', keywords: ['crm for lawyers', 'legal crm problems', 'generic crm law firm'], type: 'insight' },
    { slug: '/insights/how-to-automate-client-screening-law-firms', title: 'How to Automate Client Screening', keywords: ['client screening automation', 'automated intake screening', 'legal screening software'], type: 'insight' },
    { slug: '/insights/data-privacy-in-ai-legal-chatbots', title: 'Data Privacy in AI Legal Chatbots', keywords: ['chatbot data privacy', 'legal ai privacy', 'gdpr legal chatbot'], type: 'insight' },
    { slug: '/insights/iso-27001-readiness-law-firms', title: 'ISO 27001 Readiness for Law Firms', keywords: ['iso 27001 law firm', 'legal iso compliance', 'information security law'], type: 'insight' },
    { slug: '/insights/reducing-legal-intake-costs-with-ai', title: 'Reducing Legal Intake Costs with AI', keywords: ['reduce intake costs', 'intake cost saving', 'legal ops cost'], type: 'insight' },
    { slug: '/insights/24-7-legal-intake-automation', title: '24/7 Legal Intake Automation', keywords: ['24/7 legal intake', 'always-on intake', 'after hours legal'], type: 'insight' },
    // Comparisons
    { slug: '/vs/nomosdesk-vs-clio', title: 'NomosDesk vs Clio', keywords: ['clio alternative', 'vs clio', 'nomosdesk clio comparison'], type: 'comparison' },
    { slug: '/vs/nomosdesk-vs-mycase', title: 'NomosDesk vs MyCase', keywords: ['mycase alternative', 'vs mycase', 'mycase comparison'], type: 'comparison' },
    { slug: '/vs/nomosdesk-vs-practicepanther', title: 'NomosDesk vs PracticePanther', keywords: ['practicepanther alternative', 'vs practicepanther'], type: 'comparison' },
    { slug: '/vs/ai-chatbot-vs-traditional-intake-forms', title: 'AI Chatbot vs Traditional Intake Forms', keywords: ['chatbot vs forms', 'ai vs intake forms', 'chatbot intake comparison'], type: 'comparison' },
    // Chatbots
    { slug: '/ai-chatbot-for-personal-injury-lawyers', title: 'AI Chatbot for Personal Injury Lawyers', keywords: ['personal injury chatbot', 'pi law firm chatbot', 'personal injury intake'], type: 'chatbot' },
    { slug: '/ai-chatbot-for-immigration-lawyers', title: 'AI Chatbot for Immigration Lawyers', keywords: ['immigration chatbot', 'immigration lawyer ai', 'immigration intake'], type: 'chatbot' },
    { slug: '/ai-chatbot-for-family-lawyers', title: 'AI Chatbot for Family Lawyers', keywords: ['family law chatbot', 'family lawyer ai', 'family law intake'], type: 'chatbot' },
    { slug: '/ai-chatbot-for-criminal-defense-lawyers', title: 'AI Chatbot for Criminal Defense Lawyers', keywords: ['criminal defense chatbot', 'criminal law intake', 'defense attorney ai'], type: 'chatbot' },
    { slug: '/ai-chatbot-for-corporate-law-firms', title: 'AI Chatbot for Corporate Law Firms', keywords: ['corporate law chatbot', 'corporate legal ai', 'general counsel chatbot'], type: 'chatbot' },
];

export class InternalLinkingEngine {

    /**
     * Given a new article's primary keyword, semantic keywords, and pillar page,
     * returns the recommended set of internal links to inject.
     */
    static getLinksForArticle(opts: {
        primaryKeyword: string;
        semanticKeywords: string[];
        pillarPage: string;
        currentSlug: string;
    }): InternalLink[] {
        const { primaryKeyword, semanticKeywords, pillarPage, currentSlug } = opts;
        const allKeywords = [primaryKeyword, ...semanticKeywords].map(k => k.toLowerCase());
        const links: InternalLink[] = [];

        // 1. Mandatory pillar page link
        const pillar = LINK_GRAPH.find(p => p.slug === pillarPage && p.type === 'pillar');
        if (pillar) {
            const anchorText = this.selectAnchorText(pillar, allKeywords);
            links.push({ href: pillar.slug, anchorText, reason: 'pillar' });
        }

        // 2. 2–3 related cluster articles (score by keyword overlap, exclude self)
        const scored = LINK_GRAPH
            .filter(p => p.slug !== currentSlug && p.slug !== pillarPage && p.type !== 'core')
            .map(p => ({
                ...p,
                score: p.keywords.filter(k => allKeywords.some(ak => ak.includes(k) || k.includes(ak))).length
            }))
            .filter(p => p.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        for (const related of scored) {
            const anchorText = this.selectAnchorText(related, allKeywords);
            links.push({ href: related.slug, anchorText, reason: 'cluster' });
        }

        // 3. Conversion link — always link to pricing or demo
        links.push({ href: '/pricing', anchorText: 'view NomosDesk plans', reason: 'conversion' });

        return links;
    }

    private static selectAnchorText(page: { title: string; keywords: string[] }, articleKeywords: string[]): string {
        // Try to find a keyword that naturally fits the article context
        const match = page.keywords.find(k => articleKeywords.some(ak => ak.includes(k) || k.includes(ak)));
        if (match) return match;
        // Fallback to page title, lowercased
        return page.title.toLowerCase();
    }

    /** Register a newly deployed page into the link graph */
    static registerPage(entry: typeof LINK_GRAPH[0]): void {
        if (!LINK_GRAPH.find(p => p.slug === entry.slug)) {
            LINK_GRAPH.push(entry);
        }
    }

    /** Get all pages in the link graph */
    static getGraph() {
        return LINK_GRAPH;
    }
}
