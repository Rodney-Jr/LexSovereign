import express, { Request } from 'express';
import { LexGeminiService } from '../services/LexGeminiService';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();
const geminiService = new LexGeminiService();

router.post('/chat', authenticateToken, async (req: Request, res) => {
    try {
        const { input, matterId, documents, usePrivateModel, killSwitchActive, useGlobalSearch } = req.body;
        const result = await geminiService.chat(input, matterId, documents, usePrivateModel, killSwitchActive, useGlobalSearch);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/briefing', authenticateToken, async (req: Request, res) => {
    try {
        const { matterId, documents } = req.body;
        const result = await geminiService.generateExecutiveBriefing(matterId, documents);
        res.json({ briefing: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/scrub', authenticateToken, async (req: Request, res) => {
    try {
        const { content, role, privilege } = req.body;
        const result = await geminiService.getScrubbedContent(content, role, privilege);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/evaluate-rre', authenticateToken, async (req: Request, res) => {
    try {
        const { text, rules } = req.body;
        const tenantId = req.user.tenantId;
        const result = await geminiService.evaluateRRE(text, rules);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/public-chat', async (req, res) => {
    try {
        const { input, config, knowledge } = req.body;
        const result = await geminiService.publicChat(input, config, knowledge);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/billing-description', authenticateToken, async (req: Request, res) => {
    try {
        const { rawNotes } = req.body;
        const user = req.user;
        const result = await geminiService.generateBillingDescription(rawNotes);
        res.json({ description: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
