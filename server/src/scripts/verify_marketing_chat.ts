
import { LexAIService } from "../services/LexAIService";
import { prisma } from "../db";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function verifyMarketingChatService() {
    console.log("--- Starting Marketing Chatbot Service Verification ---");

    const lexAI = new LexAIService();
    const testMessage = "What is NomosDesk?";
    const config = {
        id: 'marketing-widget',
        botName: 'NomosDesk Assistant',
        systemInstruction: 'You are a helpful assistant.',
        isEnabled: true,
        channels: { webWidget: true },
        knowledgeBaseIds: [],
        welcomeMessage: 'Hi!'
    };

    try {
        console.log(`Calling lexAI.publicChat with message: "${testMessage}"`);

        const result = await lexAI.publicChat(testMessage, config as any, []);

        console.log("✅ Result received from LexAIService.");
        console.log("AI Response:", result.text.substring(0, 100) + "...");

        if (result.provider) {
            console.log(`✅ Provider Info Returned: ${result.provider}`);
            if (process.env.AI_PROVIDER === 'openrouter' && result.provider === 'openrouter') {
                console.log("✅ Integration Verified: Marketing chatbot is powered by OpenRouter.");
            } else {
                console.log(`ℹ️ Current Provider is ${result.provider} (Environment AI_PROVIDER=${process.env.AI_PROVIDER}).`);
            }
        } else {
            console.log("❌ Provider Info MISSING from result.");
        }

    } catch (error: any) {
        console.error("❌ Verification Failed:", error.message);
        if (error.message.includes("OPENROUTER_API_KEY")) {
            console.log("ℹ️ Note: This confirms the code path is trying to use OpenRouter but lacks an API key in this environment.");
        }
    }

    console.log("--- Verification Complete ---");
    await prisma.$disconnect();
}

verifyMarketingChatService();
