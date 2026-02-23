/**
 * ContentGenerationEngine.ts
 * Generates production-ready SEO article drafts using OpenRouter (the default AI provider).
 * Each draft is structured for direct conversion to a React TSX page component.
 */

import { KeywordCluster } from './KeywordEngine';
import { InternalLink } from './InternalLinkingEngine';

export interface ArticleSection {
    heading: string; // H2
    subSections?: Array<{ heading: string; body: string }>; // H3
    body: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface ArticleDraft {
    slug: string;
    title: string;
    metaDescription: string;
    h1: string;
    intro: string;
    sections: ArticleSection[];
    faqItems: FAQItem[];
    ctaHeading: string;
    ctaBody: string;
    internalLinks: InternalLink[];
    articleSchema: object;
    faqSchema: object;
    wordCountEstimate: number;
    generatedAt: string;
}

export class ContentGenerationEngine {

    /**
     * Generate an SEO article draft for a given keyword cluster.
     * Uses OpenRouter via direct fetch (avoids server circular deps).
     */
    static async generate(
        cluster: KeywordCluster,
        internalLinks: InternalLink[]
    ): Promise<ArticleDraft> {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || 'google/gemini-pro-1.5';

        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY is not set. Cannot generate article.');
        }

        const systemPrompt = `You are a senior SEO content strategist and legal technology writer for NomosDesk, a sovereign AI-powered legal practice management platform.

Your writing rules:
- Minimum 1200 words total across all sections
- Primary keyword: "${cluster.primaryKeyword}"
- Semantic keywords to naturally weave in (3-5 uses each): ${cluster.semanticKeywords.join(', ')}
- Reading level: Grade 6-8 (Flesch-Kincaid friendly)
- No fluff, no repetition
- No hallucinated legal advice or case citations
- Brand voice: authoritative, modern, enterprise-grade
- Always position NomosDesk as the solution
- Internal links will be added separately; do not add URLs in the output`;

        const userPrompt = `Generate a complete SEO article for NomosDesk about "${cluster.primaryKeyword}".

Return ONLY valid JSON in this exact structure:
{
  "title": "SEO-optimised title (60 chars max)",
  "metaDescription": "Compelling meta description (155 chars max)",
  "h1": "H1 heading",
  "intro": "2-3 sentence intro paragraph",
  "sections": [
    {
      "heading": "H2 heading",
      "body": "Section body (150-250 words)",
      "subSections": [
        { "heading": "H3 heading", "body": "H3 body (100-150 words)" }
      ]
    }
  ],
  "faqItems": [
    { "question": "FAQ question 1?", "answer": "FAQ answer 1 (2-3 sentences)" },
    { "question": "FAQ question 2?", "answer": "FAQ answer 2 (2-3 sentences)" },
    { "question": "FAQ question 3?", "answer": "FAQ answer 3 (2-3 sentences)" },
    { "question": "FAQ question 4?", "answer": "FAQ answer 4 (2-3 sentences)" }
  ],
  "ctaHeading": "Strong CTA heading",
  "ctaBody": "1-2 sentence CTA body"
}

Include at least 4-5 sections (H2s). Each H2 should have 1-2 H3 sub-sections.
Total word count across all sections + intro: minimum 1200 words.`;

        let parsed: any;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://app.nomosdesk.com',
                    'X-Title': process.env.OPENROUTER_SITE_NAME || 'NomosDesk',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`OpenRouter API error: ${response.status} — ${err}`);
            }

            const result = await response.json();
            const content = result.choices?.[0]?.message?.content;
            parsed = JSON.parse(content);
        } catch (e: any) {
            throw new Error(`Content generation failed: ${e.message}`);
        }

        // Build JSON-LD schemas
        const articleSchema = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: parsed.title,
            description: parsed.metaDescription,
            author: { '@type': 'Organization', name: 'NomosDesk' },
            publisher: { '@type': 'Organization', name: 'NomosDesk', url: 'https://nomosdesk.com' },
            datePublished: new Date().toISOString().split('T')[0],
            keywords: [cluster.primaryKeyword, ...cluster.semanticKeywords].join(', ')
        };

        const faqSchema = parsed.faqItems?.length > 0 ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: parsed.faqItems.map((f: FAQItem) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer }
            }))
        } : {};

        // Estimate word count
        const allText = [
            parsed.intro,
            ...parsed.sections.map((s: ArticleSection) => s.body + (s.subSections?.map(ss => ss.body).join(' ') || '')),
            ...parsed.faqItems.map((f: FAQItem) => f.answer)
        ].join(' ');
        const wordCountEstimate = allText.split(/\s+/).length;

        return {
            slug: cluster.slug,
            title: parsed.title,
            metaDescription: parsed.metaDescription,
            h1: parsed.h1,
            intro: parsed.intro,
            sections: parsed.sections,
            faqItems: parsed.faqItems,
            ctaHeading: parsed.ctaHeading,
            ctaBody: parsed.ctaBody,
            internalLinks,
            articleSchema,
            faqSchema,
            wordCountEstimate,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Quick preview/outline generation (no full article body, much cheaper).
     */
    static async generateOutline(cluster: KeywordCluster): Promise<{ title: string; h2s: string[] }> {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const fastModel = process.env.OPENROUTER_FAST_MODEL || 'mistralai/mistral-7b-instruct';

        if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set.');

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: fastModel,
                messages: [{
                    role: 'user',
                    content: `Generate an SEO article outline for a legal SaaS blog about "${cluster.primaryKeyword}". Return JSON: { "title": "...", "h2s": ["heading1", "heading2", ...] }. Include 5-6 H2 headings.`
                }],
                response_format: { type: 'json_object' }
            })
        });

        const result = await response.json();
        return JSON.parse(result.choices?.[0]?.message?.content || '{}');
    }
}
