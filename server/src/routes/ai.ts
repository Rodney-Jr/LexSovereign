import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AIService } from '../services/AIService';

const router = express.Router();

/**
 * Trigger AI Risk Analysis for a contract
 */
router.post('/analyze-contract', authenticateToken, async (req, res) => {
    try {
        const { matterId, content } = req.body;
        const analysis = await AIService.analyzeContractRisk(matterId, content);
        res.json(analysis);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate AI Case Summary
 */
router.post('/summarize-case', authenticateToken, async (req, res) => {
    try {
        const { matterId, documents } = req.body;
        const summary = await AIService.summarizeCase(matterId, documents || []);
        res.json({ summary });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Predict Deadline Risk
 */
router.get('/deadline-risk/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const risk = await AIService.predictDeadlineRisk(id);
        res.json(risk);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
