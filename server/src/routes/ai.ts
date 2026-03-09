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

export default router;
