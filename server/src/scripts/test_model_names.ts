
import * as dotenv from 'dotenv';
import * as path from 'path';
import { GoogleGenAI } from "@google/genai";

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function testModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY not found");
        return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const candidates = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-001',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.0-pro',
        'gemini-pro'
    ];

    console.log("Testing model names...");

    for (const modelName of candidates) {
        console.log(`Trying model: ${modelName}`);
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: "Hello",
                config: { maxOutputTokens: 5 }
            });
            console.log(`✅ Success: ${modelName}`);
            return; // Exit after first success
        } catch (e: any) {
            console.log(`❌ Failed: ${modelName} - ${e.message ? e.message.substring(0, 100) : 'Unknown error'}`);
        }
    }
    console.log("All models failed.");
}

testModels();
