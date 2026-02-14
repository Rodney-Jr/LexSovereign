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

// FAQ Knowledge Base for fallback when AI is unavailable
interface FAQ {
    id: string;
    question: string;
    answer: string;
    keywords: string[];
    category: 'features' | 'pricing' | 'security' | 'general';
}

const FAQ_DATABASE: FAQ[] = [
    {
        id: 'what-is-lexsovereign',
        question: 'What is LexSovereign?',
        answer: 'LexSovereign is a sovereign legal operations platform designed for law firms and in-house legal teams. We provide matter management, document automation, AI-powered legal research, secure client portals, billing & time tracking, and multi-jurisdictional support—all built with privacy-first architecture and data sovereignty principles.',
        keywords: ['what', 'lexsovereign', 'platform', 'about', 'describe', 'tell me'],
        category: 'general'
    },
    {
        id: 'features',
        question: 'What features does LexSovereign offer?',
        answer: 'LexSovereign offers: Matter Management, Document Automation, AI-Powered Legal Research, Secure Client Portals, Time Tracking & Billing, Multi-Jurisdictional Support, Regulatory Compliance Tools, Workflow Automation, and Advanced Analytics. All features are built with enterprise-grade security and data sovereignty in mind.',
        keywords: ['features', 'capabilities', 'what can', 'functionality', 'tools', 'offer'],
        category: 'features'
    },
    {
        id: 'pricing',
        question: 'How much does LexSovereign cost?',
        answer: 'We offer flexible pricing plans tailored to your firm\'s size and needs. Our plans include Standard, Sovereign, and Enclave Exclusive tiers. For personalized pricing and to discuss which plan is right for you, I recommend scheduling a demo with our team at https://lexsovereign.com/demo',
        keywords: ['price', 'pricing', 'cost', 'how much', 'plans', 'subscription', 'fee'],
        category: 'pricing'
    },
    {
        id: 'security',
        question: 'Is my data secure with LexSovereign?',
        answer: 'Absolutely! LexSovereign is built with privacy-first architecture and data sovereignty principles. We offer end-to-end encryption, BYOK (Bring Your Own Key) options, regional data residency, and both cloud and on-premise deployment options. Your data never leaves your chosen jurisdiction without your explicit consent.',
        keywords: ['secure', 'security', 'safe', 'privacy', 'data protection', 'encryption', 'confidential'],
        category: 'security'
    },
    {
        id: 'ai-research',
        question: 'How does the AI legal research work?',
        answer: 'Our AI-powered legal research uses advanced language models combined with jurisdiction-specific statutory databases. It can search official gazettes, case law, and regulatory documents across multiple jurisdictions, providing cited references and confidence scores for every answer. The AI is designed to assist lawyers, not replace them.',
        keywords: ['ai', 'research', 'artificial intelligence', 'legal research', 'search', 'case law'],
        category: 'features'
    },
    {
        id: 'demo',
        question: 'How can I schedule a demo?',
        answer: 'You can schedule a personalized demo at https://lexsovereign.com/demo or by filling out the demo request form on our website. Our team will walk you through the platform and answer any questions specific to your practice.',
        keywords: ['demo', 'demonstration', 'trial', 'try', 'test', 'see it', 'show me'],
        category: 'general'
    },
    {
        id: 'deployment',
        question: 'Do you offer on-premise deployment?',
        answer: 'Yes! LexSovereign supports both cloud and on-premise deployment options. Our Enclave Exclusive plan is specifically designed for organizations that require complete data sovereignty with on-premise or private cloud deployment.',
        keywords: ['on-premise', 'on premise', 'deployment', 'self-hosted', 'private cloud', 'install'],
        category: 'security'
    },
    {
        id: 'support',
        question: 'What kind of support do you provide?',
        answer: 'We provide comprehensive support including: 24/7 technical support for Sovereign and Enclave plans, dedicated account managers, onboarding assistance, training resources, and a knowledge base. Standard plan includes email support with 24-hour response time.',
        keywords: ['support', 'help', 'assistance', 'customer service', 'contact'],
        category: 'general'
    },
    {
        id: 'jurisdictions',
        question: 'What jurisdictions do you support?',
        answer: 'LexSovereign supports multi-jurisdictional legal work with region-specific statutory knowledge bases. We currently have comprehensive coverage for Ghana, Nigeria, Kenya, South Africa, UK, and USA, with expanding coverage for other Commonwealth and African jurisdictions.',
        keywords: ['jurisdiction', 'countries', 'regions', 'international', 'global', 'africa'],
        category: 'features'
    },
    {
        id: 'getting-started',
        question: 'How do I get started?',
        answer: 'Getting started is easy! Schedule a demo at https://lexsovereign.com/demo to see the platform in action. After that, we\'ll help you choose the right plan, set up your account, migrate your data, and train your team. Most firms are fully operational within 48 hours.',
        keywords: ['get started', 'start', 'begin', 'onboard', 'sign up', 'register'],
        category: 'general'
    }
];

// Keyword matching functions
function extractKeywords(text: string): string[] {
    // Normalize and extract meaningful words
    const normalized = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ')      // Normalize whitespace
        .trim();

    // Remove common stop words
    const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'i', 'you', 'we', 'they', 'it', 'this',
        'that', 'these', 'those', 'to', 'from', 'in', 'on', 'at', 'for', 'with']);

    return normalized.split(' ').filter(word => word.length > 2 && !stopWords.has(word));
}

function calculateMatchScore(userKeywords: string[], faqKeywords: string[]): number {
    let score = 0;
    for (const userKeyword of userKeywords) {
        for (const faqKeyword of faqKeywords) {
            if (userKeyword.includes(faqKeyword) || faqKeyword.includes(userKeyword)) {
                score += 1;
            }
        }
    }
    return score;
}

function findBestFAQ(userMessage: string): FAQ | null {
    const userKeywords = extractKeywords(userMessage);
    if (userKeywords.length === 0) return null;

    let bestMatch: FAQ | null = null;
    let highestScore = 0;
    const THRESHOLD = 1; // Minimum score to consider a match

    for (const faq of FAQ_DATABASE) {
        const score = calculateMatchScore(userKeywords, faq.keywords);
        if (score > highestScore) {
            highestScore = score;
            bestMatch = faq;
        }
    }

    return highestScore >= THRESHOLD ? bestMatch : null;
}

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

            // Try FAQ fallback
            const faqMatch = findBestFAQ(message);
            if (faqMatch) {
                aiResponseText = faqMatch.answer;
                console.log(`FAQ Fallback used: ${faqMatch.id}`);
            } else {
                // Generic fallback if no FAQ matches
                aiResponseText = "Thank you for your message! I'm having trouble connecting to my AI service right now. Please try again in a moment, or feel free to schedule a demo to speak with our team directly at https://lexsovereign.com/demo";
            }
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
