/**
 * contentEngine.ts — REST API for the NomosDesk Content Automation Engine
 * All routes require GLOBAL_ADMIN role.
 *
 * GET  /api/content-engine/keywords     → keyword opportunity registry
 * POST /api/content-engine/generate     → AI-generate article draft
 * POST /api/content-engine/deploy       → write TSX + patch App.tsx + sitemap
 * GET  /api/content-engine/queue        → all articles (deployed + pending)
 * POST /api/content-engine/refresh      → trigger refresh job
 * GET  /api/content-engine/refresh      → refresh queue status
 * GET  /api/content-engine/audit        → scan insights dir for thin content
 */

import { Router, Request, Response } from 'express';
import path from 'path';
import { authenticateToken, requireRole } from '../middleware/auth';
import { KeywordEngine } from '../services/ContentEngine/KeywordEngine';
import { ContentGenerationEngine } from '../services/ContentEngine/ContentGenerationEngine';
import { InternalLinkingEngine } from '../services/ContentEngine/InternalLinkingEngine';
import { ArticleCodegenService } from '../services/ContentEngine/ArticleCodegenService';
import { ContentRefreshEngine } from '../services/ContentEngine/ContentRefreshEngine';

const router = Router();
const GUARD = [authenticateToken, requireRole(['GLOBAL_ADMIN'])];

// ─── Keyword Registry ─────────────────────────────────────────────────────────

router.get('/keywords', ...GUARD, (_req: Request, res: Response) => {
    try {
        const summary = KeywordEngine.getSummary();
        const pending = KeywordEngine.getPending();
        const deployed = KeywordEngine.getDeployed();
        res.json({ summary, pending, deployed });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── Generate Article Draft ───────────────────────────────────────────────────

router.post('/generate', ...GUARD, async (req: Request, res: Response) => {
    const { slug, outlineOnly } = req.body;

    if (!slug) {
        return res.status(400).json({ error: 'slug is required' });
    }

    const cluster = KeywordEngine.getBySlug(slug);
    if (!cluster) {
        return res.status(404).json({ error: `No keyword cluster found for slug: ${slug}` });
    }

    if (cluster.deployed) {
        return res.status(409).json({ error: `Slug ${slug} is already deployed. Use /refresh instead.` });
    }

    try {
        if (outlineOnly) {
            const outline = await ContentGenerationEngine.generateOutline(cluster);
            return res.json({ outline });
        }

        const internalLinks = InternalLinkingEngine.getLinksForArticle({
            primaryKeyword: cluster.primaryKeyword,
            semanticKeywords: cluster.semanticKeywords,
            pillarPage: cluster.pillarPage,
            currentSlug: cluster.slug
        });

        const draft = await ContentGenerationEngine.generate(cluster, internalLinks);
        res.json({ draft });

    } catch (e: any) {
        console.error('[ContentEngine] Generation error:', e);
        res.status(500).json({ error: e.message });
    }
});

// ─── Deploy Article (write file + patch App.tsx + sitemap) ───────────────────

router.post('/deploy', ...GUARD, async (req: Request, res: Response) => {
    const { slug, draft: draftPayload } = req.body;

    if (!slug) {
        return res.status(400).json({ error: 'slug is required' });
    }

    const cluster = KeywordEngine.getBySlug(slug);
    if (!cluster) {
        return res.status(404).json({ error: `No keyword cluster found for slug: ${slug}` });
    }

    try {
        let draft = draftPayload;

        // If no pre-generated draft provided, generate on the fly
        if (!draft) {
            const internalLinks = InternalLinkingEngine.getLinksForArticle({
                primaryKeyword: cluster.primaryKeyword,
                semanticKeywords: cluster.semanticKeywords,
                pillarPage: cluster.pillarPage,
                currentSlug: cluster.slug
            });
            draft = await ContentGenerationEngine.generate(cluster, internalLinks);
        }

        const result = ArticleCodegenService.deploy(draft, cluster);
        KeywordEngine.markDeployed(cluster.id);

        // Register in the link graph for future articles
        InternalLinkingEngine.registerPage({
            slug: cluster.slug,
            title: draft.title,
            keywords: [cluster.primaryKeyword, ...cluster.semanticKeywords],
            type: 'insight'
        });

        res.json({
            success: true,
            ...result,
            wordCount: draft.wordCountEstimate,
            message: `✅ Deployed ${slug} — TSX written, App.tsx & sitemap patched.`
        });

    } catch (e: any) {
        console.error('[ContentEngine] Deploy error:', e);
        res.status(500).json({ error: e.message });
    }
});

// ─── Article Queue ────────────────────────────────────────────────────────────

router.get('/queue', ...GUARD, (_req: Request, res: Response) => {
    const all = KeywordEngine.getAll();
    res.json({
        total: all.length,
        pending: all.filter(k => !k.deployed).length,
        deployed: all.filter(k => k.deployed).length,
        articles: all.map(k => ({
            id: k.id,
            slug: k.slug,
            primaryKeyword: k.primaryKeyword,
            intent: k.intent,
            volume: k.estimatedMonthlyVolume,
            competition: k.competition,
            deployed: k.deployed,
            deployedAt: k.deployedAt
        }))
    });
});

// ─── Content Refresh ──────────────────────────────────────────────────────────

router.get('/refresh', ...GUARD, (_req: Request, res: Response) => {
    res.json({
        summary: ContentRefreshEngine.getSummary(),
        queue: ContentRefreshEngine.getQueue()
    });
});

router.post('/refresh', ...GUARD, async (req: Request, res: Response) => {
    const { jobId } = req.body;

    if (!jobId) {
        return res.status(400).json({ error: 'jobId is required' });
    }

    const job = ContentRefreshEngine.getJobById(jobId);
    if (!job) {
        return res.status(404).json({ error: `No refresh job found with id: ${jobId}` });
    }

    ContentRefreshEngine.updateStatus(jobId, 'in_progress');

    try {
        // For now, mark as completed and return the refresh prompt for manual AI use
        const prompt = ContentRefreshEngine.buildRefreshPrompt(job, `Article: ${job.slug}`);
        ContentRefreshEngine.updateStatus(jobId, 'completed', 'Refresh prompt generated');
        res.json({
            success: true,
            jobId,
            slug: job.slug,
            prompt,
            note: 'Use the POST /api/content-engine/deploy endpoint with the refreshed draft to update the file.'
        });
    } catch (e: any) {
        ContentRefreshEngine.updateStatus(jobId, 'failed', e.message);
        res.status(500).json({ error: e.message });
    }
});

// ─── Thin Content Audit ───────────────────────────────────────────────────────

router.get('/audit', ...GUARD, (_req: Request, res: Response) => {
    const insightsDir = path.resolve(__dirname, '../../../../../marketing/src/pages/insights');
    const audit = ContentRefreshEngine.auditInsightsDirectory(insightsDir);
    const thinCount = audit.filter(a => a.shouldRefresh).length;
    res.json({
        totalArticles: audit.length,
        thinArticles: thinCount,
        healthyArticles: audit.length - thinCount,
        details: audit
    });
});

export default router;
