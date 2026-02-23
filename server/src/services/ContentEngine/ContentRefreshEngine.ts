/**
 * ContentRefreshEngine.ts
 * Tracks underperforming articles and orchestrates AI-driven content refresh:
 * - Expand thin content to 1200+ words
 * - Update metadata
 * - Add/update FAQ sections
 * - Add new internal links
 * - Update schema markup
 */

import fs from 'fs';
import path from 'path';

export type RefreshTrigger = 'thin_content' | 'outdated_stats' | 'missing_faq' | 'missing_schema' | 'manual';
export type RefreshStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

export interface RefreshJob {
    id: string;
    slug: string;
    triggers: RefreshTrigger[];
    status: RefreshStatus;
    priority: 'high' | 'medium' | 'low';
    createdAt: string;
    completedAt?: string;
    notes?: string;
}

// ── Initial Refresh Queue ─────────────────────────────────────────────────────
// Identified by analyzing file sizes (thin articles < 4KB TSX)
const REFRESH_QUEUE: RefreshJob[] = [
    {
        id: 'ref-001',
        slug: '/insights/ai-chatbot-roi-for-law-firms',
        triggers: ['thin_content', 'missing_faq'],
        status: 'queued',
        priority: 'high',
        createdAt: '2026-02-21T06:00:00Z',
        notes: 'File is ~3.3KB, well below 1200 word target. Missing FAQ schema.'
    },
    {
        id: 'ref-002',
        slug: '/insights/conversational-ai-for-legal-websites',
        triggers: ['thin_content', 'missing_schema'],
        status: 'queued',
        priority: 'high',
        createdAt: '2026-02-21T06:00:00Z',
        notes: 'File is ~3.1KB. No JSON-LD schema present.'
    },
    {
        id: 'ref-003',
        slug: '/insights/reducing-legal-intake-costs-with-ai',
        triggers: ['thin_content'],
        status: 'queued',
        priority: 'medium',
        createdAt: '2026-02-21T06:00:00Z',
        notes: '~3.7KB file, needs more depth and statistics.'
    },
    {
        id: 'ref-004',
        slug: '/insights/24-7-legal-intake-automation',
        triggers: ['thin_content', 'missing_faq'],
        status: 'queued',
        priority: 'medium',
        createdAt: '2026-02-21T06:00:00Z',
        notes: '~3.4KB. Lacks FAQ section and is thin on detail.'
    },
    {
        id: 'ref-005',
        slug: '/insights/how-government-agencies-use-ai-chatbots',
        triggers: ['outdated_stats', 'missing_faq'],
        status: 'queued',
        priority: 'low',
        createdAt: '2026-02-21T06:00:00Z',
        notes: 'Statistics reference pre-2025 data. Needs 2026 figures + FAQ.'
    }
];

export class ContentRefreshEngine {

    static getQueue(): RefreshJob[] {
        return REFRESH_QUEUE;
    }

    static getPendingJobs(): RefreshJob[] {
        return REFRESH_QUEUE.filter(j => j.status === 'queued');
    }

    static getCompletedJobs(): RefreshJob[] {
        return REFRESH_QUEUE.filter(j => j.status === 'completed');
    }

    static getJobById(id: string): RefreshJob | undefined {
        return REFRESH_QUEUE.find(j => j.id === id);
    }

    static addToQueue(job: Omit<RefreshJob, 'id' | 'createdAt'>): RefreshJob {
        const newJob: RefreshJob = {
            ...job,
            id: `ref-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        REFRESH_QUEUE.push(newJob);
        return newJob;
    }

    static updateStatus(id: string, status: RefreshStatus, notes?: string): void {
        const job = REFRESH_QUEUE.find(j => j.id === id);
        if (job) {
            job.status = status;
            if (notes) job.notes = notes;
            if (status === 'completed') job.completedAt = new Date().toISOString();
        }
    }

    /**
     * Generate a refresh prompt for AI expansion of an existing article.
     * Returns the system + user prompt pair to send to OpenRouter.
     */
    static buildRefreshPrompt(job: RefreshJob, existingContent: string): { system: string; user: string } {
        const actions = job.triggers.map(t => {
            switch (t) {
                case 'thin_content': return 'Significantly expand the article body to at least 1200 words total. Add more detail, real examples, and actionable insights.';
                case 'outdated_stats': return 'Update all statistics and references to reflect 2026 data.';
                case 'missing_faq': return 'Add a comprehensive FAQ section with 4-5 questions relevant to the topic.';
                case 'missing_schema': return 'Add proper JSON-LD Article and FAQ schema markup.';
                case 'manual': return 'Perform a full quality pass and improvement.';
                default: return '';
            }
        }).filter(Boolean).join('\n');

        return {
            system: `You are a senior SEO content specialist improving NomosDesk marketing content. 
Brand: NomosDesk — sovereign AI-powered legal practice management platform.
Do not hallucinate legal advice or case citations.
Always end with a CTA to NomosDesk.`,
            user: `Refresh and improve the following article content. Actions required:\n${actions}\n\nReturn ONLY the improved article as a valid JSON object matching the original ContentGenerationEngine ArticleDraft schema (title, metaDescription, h1, intro, sections, faqItems, ctaHeading, ctaBody).\n\nExisting content summary:\n${existingContent.slice(0, 2000)}`
        };
    }

    /**
     * Audit existing marketing pages for refresh candidates.
     * Scans the insights directory and flags thin files.
     */
    static auditInsightsDirectory(insightsDir: string): Array<{ file: string; sizeKB: number; shouldRefresh: boolean }> {
        if (!fs.existsSync(insightsDir)) return [];
        const files = fs.readdirSync(insightsDir).filter(f => f.endsWith('.tsx'));
        return files.map(file => {
            const filePath = path.join(insightsDir, file);
            const stats = fs.statSync(filePath);
            const sizeKB = stats.size / 1024;
            return {
                file,
                sizeKB: Math.round(sizeKB * 10) / 10,
                shouldRefresh: sizeKB < 4.5 // Articles with < 4.5KB TSX are likely under 1000 words
            };
        }).sort((a, b) => a.sizeKB - b.sizeKB);
    }

    static getSummary() {
        return {
            total: REFRESH_QUEUE.length,
            queued: REFRESH_QUEUE.filter(j => j.status === 'queued').length,
            inProgress: REFRESH_QUEUE.filter(j => j.status === 'in_progress').length,
            completed: REFRESH_QUEUE.filter(j => j.status === 'completed').length,
            failed: REFRESH_QUEUE.filter(j => j.status === 'failed').length,
            highPriority: REFRESH_QUEUE.filter(j => j.priority === 'high' && j.status === 'queued').length
        };
    }
}
