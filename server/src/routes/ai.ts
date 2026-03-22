import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AIService } from '../services/AIService';

const router = express.Router();

/**
 * Trigger AI Risk Analysis for a contract
 */
router.post('/analyze-contract', authenticateToken, async (req: any, res) => {
    try {
        const { matterId, content } = req.body;
        const analysis = await AIService.analyzeContractRisk(req.user.tenantId, matterId, content);
        res.json(analysis);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate AI Case Summary
 */
router.post('/summarize-case', authenticateToken, async (req: any, res) => {
    try {
        const { matterId, documents } = req.body;
        const summary = await AIService.summarizeCase(req.user.tenantId, matterId, documents || []);
        res.json({ summary });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Predict Deadline Risk
 */
router.get('/deadline-risk/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const risk = await AIService.predictDeadlineRisk(req.user.tenantId, id);
        res.json(risk);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * AI Copilot: Identify Drafting Context
 */
router.post('/context', authenticateToken, async (req: any, res) => {
    try {
        const { content } = req.body;
        const context = await AIService.identifyDraftingContext(req.user.tenantId, content);
        res.json(context);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * AI Copilot: Detect Drafting Risks (High Fidelity)
 */
router.post('/risk-analysis', authenticateToken, async (req: any, res) => {
    try {
        const { content } = req.body;
        const risks = await AIService.detectDraftingRisks(req.user.tenantId, content);
        res.json(risks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * AI Copilot: Suggest Clauses
 */
router.post('/suggestions', authenticateToken, async (req: any, res) => {
    try {
        const { content, jurisdiction } = req.body;
        const suggestions = await AIService.suggestClauses(req.user.tenantId, content, jurisdiction);
        res.json(suggestions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * AI Copilot: Process Command
 */
router.post('/command', authenticateToken, async (req: any, res) => {
    try {
        const { command, context } = req.body;
        const result = await AIService.processCopilotCommand(req.user.tenantId, command, context);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
