import express from 'express';
import { ChatbotService } from '../services/ChatbotService';
import { LexAIService } from '../services/LexAIService';
import { prisma } from '../db';
import { KnowledgeArtifact } from '../types';

const router = express.Router();
const gemini = new LexAIService();

// Knowledge Base is now connected to DB table KnowledgeArtifact

router.get('/config/public/:botId', async (req, res) => {
    try {
        const { botId } = req.params;
        const config = await ChatbotService.getPublicConfig(botId);
        if (!config) {
            return res.status(404).json({ error: "Bot not found or disabled" });
        }
        res.json(config);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/config', async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const config = await ChatbotService.getConfig(tenantId);
        res.json(config);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/config', async (req: any, res) => {
    try {
        const newConfig = req.body;
        if (!newConfig.botName || !newConfig.systemInstruction) {
            return res.status(400).json({ error: "Missing required fields: botName, systemInstruction" });
        }
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const saved = await ChatbotService.saveConfig(tenantId, newConfig);
        res.json(saved);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Deployment Stub - In a real app, this would push config to a CDN or edge function
router.post('/deploy', async (req, res) => {
    try {
        const config = req.body;
        // Verify config integrity
        if (!config.isEnabled) {
            return res.status(400).json({ error: "Cannot deploy disabled bot." });
        }

        // Save state as 'production' version
        // Get tenantId from session
        const tenantId = (req as any).user?.tenantId || 'demo-tenant-id';
        await ChatbotService.saveConfig(tenantId, config);

        // Return success with deployment metadata
        res.json({
            status: 'DEPLOYED',
            version: `v${Date.now()}`,
            url: `https://widget.nomosdesk.com/${config.id || 'bot_default'}`,
            scriptTag: `<script src="${generateWidgetScriptUrl(req)}" data-bot-id="${config.id || 'bot_default'}"></script>`,
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        res.status(500).json({ error: "Deployment failed: " + err.message });
    }
});

function generateWidgetScriptUrl(req: express.Request) {
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = process.env.PLATFORM_URL || `${protocol}://${host}`;
    return `${baseUrl}/widget.js`;
}

// Public Chat Endpoint (Sandbox)
router.post('/chat', async (req, res) => {
    try {
        const { message, config } = req.body;

        // Fetch knowledge artifacts from DB based on current config selection
        const activeKnowledge = await prisma.knowledgeArtifact.findMany({
            where: {
                id: { in: config.knowledgeBaseIds }
            }
        });

        const response = await gemini.publicChat(message, config, activeKnowledge as any);
        res.json(response);
    } catch (err: any) {
        console.error("Chat Error:", err);
        res.status(500).json({ error: "AI Service Unavailable" });
    }
});

export default router;
