import { PrismaClient } from '@prisma/client';
import { ChatbotConfig } from '../types';

const prisma = new PrismaClient();

const DEFAULT_CONFIG: ChatbotConfig = {
    id: 'bot_default', // Will be overwritten by DB ID
    botName: 'SovereignAssistant',
    welcomeMessage: 'Welcome. I am your Sovereign Assistant. How can I help you onboard today?',
    isEnabled: true,
    channels: { whatsapp: true, webWidget: true },
    knowledgeBaseIds: [],
    systemInstruction: 'You are a lead generation bot for a premium law firm.'
};

export class ChatbotService {
    static async getConfig(tenantId: string): Promise<ChatbotConfig> {
        try {
            const config = await prisma.chatbotConfig.findUnique({
                where: { tenantId }
            });

            if (!config) {
                return { ...DEFAULT_CONFIG, id: 'new' };
            }

            return {
                id: config.id,
                botName: config.botName,
                welcomeMessage: config.welcomeMessage,
                isEnabled: config.isEnabled,
                channels: config.channels as any,
                knowledgeBaseIds: config.knowledgeBaseIds as any,
                systemInstruction: config.systemInstruction
            };
        } catch (error) {
            console.error("Failed to read chatbot config:", error);
            return DEFAULT_CONFIG;
        }
    }

    static async saveConfig(tenantId: string, config: Partial<ChatbotConfig>): Promise<ChatbotConfig> {
        try {
            const upserted = await prisma.chatbotConfig.upsert({
                where: { tenantId },
                update: {
                    botName: config.botName,
                    welcomeMessage: config.welcomeMessage,
                    isEnabled: config.isEnabled,
                    channels: config.channels as any,
                    knowledgeBaseIds: config.knowledgeBaseIds as any,
                    systemInstruction: config.systemInstruction
                },
                create: {
                    tenantId,
                    botName: config.botName || DEFAULT_CONFIG.botName,
                    welcomeMessage: config.welcomeMessage || DEFAULT_CONFIG.welcomeMessage,
                    isEnabled: config.isEnabled ?? DEFAULT_CONFIG.isEnabled,
                    channels: (config.channels || DEFAULT_CONFIG.channels) as any,
                    knowledgeBaseIds: (config.knowledgeBaseIds || DEFAULT_CONFIG.knowledgeBaseIds) as any,
                    systemInstruction: config.systemInstruction || DEFAULT_CONFIG.systemInstruction
                }
            });

            return {
                id: upserted.id,
                botName: upserted.botName,
                welcomeMessage: upserted.welcomeMessage,
                isEnabled: upserted.isEnabled,
                channels: upserted.channels as any,
                knowledgeBaseIds: upserted.knowledgeBaseIds as any,
                systemInstruction: upserted.systemInstruction
            };
        } catch (error) {
            console.error("Failed to save chatbot config:", error);
            throw new Error("Failed to persist configuration");
        }
    }

    static async getPublicConfig(botId: string): Promise<Partial<ChatbotConfig> | null> {
        try {
            const config = await prisma.chatbotConfig.findUnique({
                where: { id: botId, isEnabled: true }
            });

            if (!config) return null;

            // Only return safe public fields
            return {
                id: config.id,
                botName: config.botName,
                welcomeMessage: config.welcomeMessage,
                channels: config.channels as any
            };
        } catch (error) {
            console.error("Error fetching public bot config:", error);
            return null;
        }
    }
}
