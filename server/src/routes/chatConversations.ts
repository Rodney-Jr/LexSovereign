import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { LexAIService } from '../services/LexAIService';
import { ChatbotConfig } from '../types';

const router = express.Router();
const lexAI = new LexAIService();

// Marketing chatbot configuration
const MARKETING_CHATBOT_CONFIG: ChatbotConfig = {
    id: 'marketing-widget',
    botName: 'LexSovereign Assistant',
    systemInstruction: `You are the LexSovereign AI Assistant, helping visitors learn about our legal operations platform.

About LexSovereign:
- A sovereign legal operations platform for law firms and in-house legal teams
- Features include: matter management, document automation, AI-powered legal research, secure client portals, billing & time tracking
- Built with privacy-first architecture and data sovereignty principles
- Supports multi-jurisdictional legal work with region-specific statutory knowledge
- Offers both cloud and on-premise deployment options

Your role:
- Answer questions about LexSovereign's features, pricing, and capabilities
- Help visitors understand how the platform can benefit their legal practice
- Be professional, helpful, and concise
- If asked about specific pricing, suggest scheduling a demo for personalized pricing
- If you don't know something, be honest and offer to connect them with our team

Tone: Professional, knowledgeable, and friendly`,
    isEnabled: true,
    channels: {
        whatsapp: false,
        webWidget: true
    },
    knowledgeBaseIds: [],
    welcomeMessage: 'Hi! How can I help you learn more about LexSovereign?'
};

// Public: Submit a chat message and get AI response
router.post('/', async (req, res) => {
    try {
        const { sessionId, message, visitorEmail, visitorName } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ error: "Session ID and message are required." });
        }

        // Find or create conversation
        let conversation = await prisma.chatConversation.findFirst({
            where: { sessionId }
        });

        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        // Get conversation history for context
        const conversationHistory = conversation?.messages as any[] || [];

        // Generate AI response using LexAIService
        let aiResponseText: string;
        try {
            const aiResult = await lexAI.publicChat(
                message,
                MARKETING_CHATBOT_CONFIG,
                [] // No knowledge base artifacts for now
            );
            aiResponseText = aiResult.text;
        } catch (error: any) {
            console.error('AI Service Error:', error);
            // Fallback response if AI fails
            aiResponseText = "Thank you for your message! I'm having trouble connecting to my AI service right now. Please try again in a moment, or feel free to schedule a demo to speak with our team directly.";
        }

        const aiResponse = {
            role: 'assistant',
            content: aiResponseText,
            timestamp: new Date().toISOString()
        };

        if (conversation) {
            // Update existing conversation
            const messages = conversation.messages as any[];
            messages.push(userMessage, aiResponse);

            conversation = await prisma.chatConversation.update({
                where: { id: conversation.id },
                data: {
                    messages,
                    visitorEmail: visitorEmail || conversation.visitorEmail,
                    visitorName: visitorName || conversation.visitorName
                }
            });
        } else {
            // Create new conversation
            conversation = await prisma.chatConversation.create({
                data: {
                    sessionId,
                    visitorEmail,
                    visitorName,
                    messages: [userMessage, aiResponse],
                    source: 'MARKETING_WIDGET',
                    status: 'ACTIVE'
                }
            });
        }

        res.status(200).json({
            response: aiResponse.content,
            conversationId: conversation.id
        });
    } catch (error: any) {
        console.error("Chat conversation error:", error);
        res.status(500).json({ error: "Failed to process message." });
    }
});

// Admin: Get all conversations
router.get('/', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const conversations = await prisma.chatConversation.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to recent 100 conversations
        });

        res.json(conversations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get single conversation
router.get('/:id', authenticateToken, requireRole(['GLOBAL_ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await prisma.chatConversation.findUnique({
            where: { id }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found." });
        }

        res.json(conversation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
