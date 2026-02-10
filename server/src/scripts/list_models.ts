
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { GoogleGenAI } from "@google/genai";

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY not found");
        return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const models = await ai.models.list();
        console.log("Available Models:");
        // The list method usually returns an async iterable or array depending on version
        // Let's try to iterate or print
        for await (const model of models) {
            const m = model as any;
            console.log(`- ${m.name}`);
            console.log(`  Display Name: ${m.displayName}`);
            console.log(`  Supported Generation Methods: ${m.supportedGenerationMethods}`);
        }
    } catch (e: any) {
        console.error("Error listing models:", e);
    }
}

listModels();
