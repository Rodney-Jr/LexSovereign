import express from 'express';
import { ChatbotService } from '../services/ChatbotService';
import { LexGeminiService } from '../services/LexGeminiService';
import { KnowledgeArtifact } from '../types';

const router = express.Router();
const gemini = new LexGeminiService();

// Mock Knowledge Base until connected to DB or vector store
const MOCK_KNOWLEDGE: KnowledgeArtifact[] = [
    { id: 'k1', title: 'Onboarding Process', category: 'OnboardingProcess', content: 'Our client onboarding takes 48 hours. We require Identity verification and a Conflict Check.', lastIndexed: '2h ago' },
    { id: 'k2', title: 'Corporate Practice', category: 'PracticeArea', content: 'We specialize in corporate governance and structural property disputes.', lastIndexed: '1d ago' },
    { id: 'k3', title: 'Fee Structure', category: 'Faq', content: 'Initial consultation is standard. We use statutory Scale of Fees for litigation.', lastIndexed: '3d ago' }
];

router.get('/config', (req, res) => {
    try {
        const config = ChatbotService.getConfig();
        res.json(config);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/config', (req, res) => {
    try {
        const newConfig = req.body;
        if (!newConfig.botName || !newConfig.systemInstruction) {
            return res.status(400).json({ error: "Missing required fields: botName, systemInstruction" });
        }
        const saved = ChatbotService.saveConfig(newConfig);
        res.json(saved);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Deployment Stub - In a real app, this would push config to a CDN or edge function
router.post('/deploy', (req, res) => {
    try {
        const config = req.body;
        // Verify config integrity
        if (!config.isEnabled) {
            return res.status(400).json({ error: "Cannot deploy disabled bot." });
        }

        // Save state as 'production' version
        ChatbotService.saveConfig(config);

        // Return success with deployment metadata
        res.json({
            status: 'DEPLOYED',
            version: `v${Date.now()}`,
            url: `https://widget.lexsovereign.com/${config.id}`,
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        res.status(500).json({ error: "Deployment failed: " + err.message });
    }
});

// Public Chat Endpoint (Sandbox)
router.post('/chat', async (req, res) => {
    try {
        const { message, config } = req.body;

        // Filter knowledge artifacts based on current config selection
        const activeKnowledge = MOCK_KNOWLEDGE.filter(k =>
            config.knowledgeBaseIds.includes(k.id)
        );

        const response = await gemini.publicChat(message, config, activeKnowledge);
        res.json(response);
    } catch (err: any) {
        console.error("Chat Error:", err);
        res.status(500).json({ error: "AI Service Unavailable" });
    }
});

export default router;
