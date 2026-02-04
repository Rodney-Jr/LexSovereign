
import * as dotenv from 'dotenv';
import * as path from 'path';

// Calculate path to .env (assuming script is in src/scripts and .env is in server/)
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

import { LexGeminiService } from '../services/LexGeminiService';
import { prisma } from '../db';

async function verify() {
    console.log("---------------------------------------------------");
    console.log("Verifying Jurisdictional Legal Integration (Direct DB Check)");

    try {
        const count = await prisma.knowledgeArtifact.count();
        console.log(`KnowledgeArtifacts in DB: ${count}`);

        if (count > 0) {
            const sample = await prisma.knowledgeArtifact.findFirst({
                where: { content: { contains: 'president', mode: 'insensitive' } }
            });
            if (sample) {
                console.log(`Sample Match for 'president': "${sample.title}" (${sample.category})`);
            } else {
                console.log("No docs matched 'president' yet, but DB has content.");
            }
        } else {
            console.warn("DB is empty! Ingestion might be lagging or failed.");
        }
    } catch (e) {
        console.error("DB Check Failed:", e);
    }

    console.log("---------------------------------------------------");

    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ GEMINI_API_KEY not found in .env. Skipping AI Chat verification.");
        return;
    }

    console.log("Verifying AI Service Integration...");
    const service = new LexGeminiService();
    const query = "qualifications of president";

    try {
        const response = await service.chat(
            query,
            null, // matterId
            [],   // documents (context)
            false,// usePrivateModel
            false,// killSwitch
            true  // useGlobalSearch (triggers Knowledge Base search)
        );

        console.log("Query:", query);
        console.log("Provider:", response.provider);
        console.log("Response Preview:", response.text.substring(0, 200));

    } catch (e) {
        console.error("AI Verification failed:", e);
    }
}

verify();
