import express from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

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

        // Simple AI response (can be enhanced with actual AI integration)
        const aiResponse = {
            role: 'assistant',
            content: `Thank you for your message! A member of our team will review your inquiry and get back to you shortly. In the meantime, you can explore our platform features or schedule a demo.`,
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
