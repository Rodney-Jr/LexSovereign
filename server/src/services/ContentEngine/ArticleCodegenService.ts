/**
 * ArticleCodegenService.ts
 * Converts an ArticleDraft into a production-ready .tsx file,
 * then automatically patches marketing/src/App.tsx and
 * marketing/scripts/generate-sitemap.js to register the new route.
 */

import fs from 'fs';
import path from 'path';
import { ArticleDraft } from './ContentGenerationEngine';
import { KeywordCluster } from './KeywordEngine';

const MARKETING_ROOT = path.resolve(__dirname, '../../../../../marketing');
const PAGES_DIR = path.join(MARKETING_ROOT, 'src/pages');
const APP_TSX = path.join(MARKETING_ROOT, 'src/App.tsx');
const SITEMAP_SCRIPT = path.join(MARKETING_ROOT, 'scripts/generate-sitemap.js');

export interface DeployResult {
    filePath: string;
    slug: string;
    routeRegistered: boolean;
    sitemapUpdated: boolean;
}

export class ArticleCodegenService {

    /**
     * Converts an ArticleDraft to a TSX component file.
     * Returns the absolute path to the written file.
     */
    static generateTSX(draft: ArticleDraft, cluster: KeywordCluster): string {
        const componentName = this.slugToComponentName(draft.slug);
        const targetDir = this.getTargetDir(draft.slug);
        const fileName = `${componentName}.tsx`;
        const filePath = path.join(targetDir, fileName);

        // Build internal link JSX string for injection
        const linkImports = draft.internalLinks.length > 0
            ? "import { Link } from '../../utils/ssr-compat';\n"
            : '';

        // Render sections as JSX
        const sectionsJSX = draft.sections.map(section => {
            const subSectionsJSX = (section.subSections || []).map(sub => `
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-white mb-3">${sub.heading}</h3>
                            <p className="text-slate-400 leading-relaxed">${this.escapeJSX(sub.body)}</p>
                        </div>`).join('');
            return `
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">${section.heading}</h2>
                        <p className="text-slate-400 leading-relaxed">${this.escapeJSX(section.body)}</p>
                        ${subSectionsJSX}
                    </div>`;
        }).join('\n');

        // Render FAQ items
        const faqJSX = draft.faqItems.length > 0 ? `
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            ${draft.faqItems.map(f => `
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                                <h3 className="font-bold text-white mb-2">${this.escapeJSX(f.question)}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">${this.escapeJSX(f.answer)}</p>
                            </div>`).join('\n')}
                        </div>
                    </div>` : '';

        // Render internal links panel
        const relatedLinksJSX = draft.internalLinks.filter(l => l.reason !== 'conversion').length > 0 ? `
                    <div className="mt-12 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Related Resources</h3>
                        <ul className="space-y-2">
                            ${draft.internalLinks.filter(l => l.reason !== 'conversion').map(l => `
                            <li><Link to="${l.href}" className="text-indigo-400 hover:text-indigo-300 text-sm">${l.anchorText}</Link></li>`).join('')}
                        </ul>
                    </div>` : '';

        const schemaArray = [draft.articleSchema, ...(draft.faqSchema && Object.keys(draft.faqSchema).length > 0 ? [draft.faqSchema] : [])];

        const tsx = `import React from 'react';
import Layout from '${this.getLayoutPath(draft.slug)}';
import SEO from '${this.getSEOPath(draft.slug)}';
import { Section, Button } from '${this.getUIPath(draft.slug)}';
${linkImports}
export default function ${componentName}() {
    return (
        <Layout>
            <SEO
                title="${this.escapeAttr(draft.title)}"
                description="${this.escapeAttr(draft.metaDescription)}"
                schema={${JSON.stringify(schemaArray, null, 4).replace(/"/g, "'")}}
            />
            <Section className="pt-32 pb-12 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">${this.escapeJSX(draft.h1)}</h1>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">${this.escapeJSX(draft.intro)}</p>
                </div>
            </Section>
            <Section className="pb-24 bg-slate-950">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="prose prose-invert max-w-none">
${sectionsJSX}
${faqJSX}
${relatedLinksJSX}
                    </div>

                    <div className="mt-16 p-8 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl text-center">
                        <h3 className="text-xl font-bold text-white mb-4">${this.escapeJSX(draft.ctaHeading)}</h3>
                        <p className="text-slate-300 mb-8">${this.escapeJSX(draft.ctaBody)}</p>
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('nomosdesk-open-demo'))}>
                            Book a Free Demo
                        </Button>
                    </div>
                </div>
            </Section>
        </Layout>
    );
}
`;

        // Ensure directory exists
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(filePath, tsx, 'utf-8');
        console.log(`[ContentEngine] ✅ Wrote TSX: ${filePath}`);
        return filePath;
    }

    /**
     * Patches marketing/src/App.tsx to add the new lazy import + Route.
     */
    static patchAppTSX(draft: ArticleDraft): boolean {
        const componentName = this.slugToComponentName(draft.slug);
        const importPath = this.getImportPath(draft.slug);
        const routePath = draft.slug;

        let appContent = fs.readFileSync(APP_TSX, 'utf-8');

        // Check if already registered
        if (appContent.includes(`import('./${importPath}')`)) {
            console.log(`[ContentEngine] App.tsx already has route for ${draft.slug}`);
            return false;
        }

        // Insert lazy import before the PageLoader function
        const importLine = `const ${componentName} = lazySSR(() => import('./${importPath}'));\n`;
        appContent = appContent.replace(
            '// Page-transition loading fallback',
            `${importLine}\n// Page-transition loading fallback`
        );

        // Insert Route before </Routes>
        const isInsights = draft.slug.startsWith('/insights/');
        const isVs = draft.slug.startsWith('/vs/');
        const routeLine = `                    <Route path="${routePath}" element={<${componentName} />} />\n`;

        if (isInsights) {
            // Insert before the pillar routes comment
            appContent = appContent.replace(
                '                    {/* Pillar Routes */}',
                `${routeLine}                    {/* Pillar Routes */}`
            );
        } else if (isVs) {
            // Insert before chatbot routes comment
            appContent = appContent.replace(
                '                    {/* Chatbot Pillar',
                `${routeLine}                    {/* Chatbot Pillar`
            );
        } else {
            // Insert before closing Routes
            appContent = appContent.replace(
                '                </Routes>',
                `${routeLine}                </Routes>`
            );
        }

        fs.writeFileSync(APP_TSX, appContent, 'utf-8');
        console.log(`[ContentEngine] ✅ Patched App.tsx: added <Route path="${routePath}" />`);
        return true;
    }

    /**
     * Patches marketing/scripts/generate-sitemap.js to add the new URL.
     */
    static patchSitemap(draft: ArticleDraft, cluster: KeywordCluster): boolean {
        let sitemapContent = fs.readFileSync(SITEMAP_SCRIPT, 'utf-8');

        // Already registered?
        if (sitemapContent.includes(`url: '${draft.slug}'`)) {
            return false;
        }

        const priority = cluster.intent === 'transactional' ? '0.8' :
            cluster.intent === 'commercial' ? '0.8' : '0.7';
        const entry = `  { url: '${draft.slug}', priority: '${priority}', changefreq: 'monthly' },\n];`;

        sitemapContent = sitemapContent.replace('];', entry);
        fs.writeFileSync(SITEMAP_SCRIPT, sitemapContent, 'utf-8');
        console.log(`[ContentEngine] ✅ Patched sitemap.js: added ${draft.slug}`);
        return true;
    }

    /**
     * Full deploy: write TSX + patch App.tsx + patch sitemap.
     */
    static deploy(draft: ArticleDraft, cluster: KeywordCluster): DeployResult {
        const filePath = this.generateTSX(draft, cluster);
        const routeRegistered = this.patchAppTSX(draft);
        const sitemapUpdated = this.patchSitemap(draft, cluster);
        return { filePath, slug: draft.slug, routeRegistered, sitemapUpdated };
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    static slugToComponentName(slug: string): string {
        // '/insights/ai-contract-review-software' → 'AiContractReviewSoftware'
        const parts = slug.replace(/^\//, '').split('/');
        const lastPart = parts[parts.length - 1];
        return lastPart.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    }

    private static getTargetDir(slug: string): string {
        if (slug.startsWith('/insights/')) return path.join(PAGES_DIR, 'insights');
        if (slug.startsWith('/vs/')) return path.join(PAGES_DIR, 'comparisons');
        if (slug.startsWith('/ai-chatbot-for-')) return path.join(PAGES_DIR, 'chatbots');
        return PAGES_DIR;
    }

    private static getImportPath(slug: string): string {
        const name = this.slugToComponentName(slug);
        if (slug.startsWith('/insights/')) return `pages/insights/${name}`;
        if (slug.startsWith('/vs/')) return `pages/comparisons/${name}`;
        if (slug.startsWith('/ai-chatbot-for-')) return `pages/chatbots/${name}`;
        return `pages/${name}`;
    }

    private static getLayoutPath(slug: string): string {
        if (slug.startsWith('/insights/')) return '../../layouts/Layout';
        return '../layouts/Layout';
    }

    private static getSEOPath(slug: string): string {
        if (slug.startsWith('/insights/')) return '../../components/SEO';
        return '../components/SEO';
    }

    private static getUIPath(slug: string): string {
        if (slug.startsWith('/insights/')) return '../../components/ui';
        return '../components/ui';
    }

    private static escapeJSX(text: string): string {
        return (text || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/{/g, '&#123;').replace(/}/g, '&#125;');
    }

    private static escapeAttr(text: string): string {
        return (text || '').replace(/"/g, '\\"');
    }
}
