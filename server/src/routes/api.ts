import express from 'express';
import { LexGeminiService } from '../services/LexGeminiService';

const router = express.Router();
const geminiService = new LexGeminiService();

router.post('/chat', async (req, res) => {
    try {
        const { input, matterId, documents, usePrivateModel, killSwitchActive, useGlobalSearch } = req.body;
        const result = await geminiService.chat(input, matterId, documents, usePrivateModel, killSwitchActive, useGlobalSearch);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/briefing', async (req, res) => {
    try {
        const { matterId, documents } = req.body;
        const result = await geminiService.generateExecutiveBriefing(matterId, documents);
        res.json({ briefing: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/scrub', async (req, res) => {
    try {
        const { content, role, privilege } = req.body;
        const result = await geminiService.getScrubbedContent(content, role, privilege);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
