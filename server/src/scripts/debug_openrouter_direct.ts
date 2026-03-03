
import { OpenAI } from "openai";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testOpenRouter() {
    console.log("--- Direct OpenRouter Connectivity Test ---");
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_FAST_MODEL || "mistralai/mistral-7b-instruct";

    console.log("Model:", model);
    console.log("API Key exists:", !!apiKey);
    if (apiKey) console.log("API Key Prefix:", apiKey.substring(0, 10));

    if (!apiKey) {
        console.error("❌ OPENROUTER_API_KEY is missing!");
        return;
    }

    const client = new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
            "HTTP-Referer": "https://app.nomosdesk.com",
            "X-Title": "NomosDesk DEBUG",
        },
    });

    try {
        console.log("Sending test request...");
        const response = await client.chat.completions.create({
            model: model,
            messages: [
                { role: "user", content: "Say hello." }
            ],
            max_tokens: 10
        });

        console.log("✅ SUCCESS!");
        console.log("Response:", response.choices[0].message.content);
    } catch (error: any) {
        console.error("❌ FAILED!");
        if (error.response) {
            console.error("Status:", error.status);
            console.error("Data:", error.data);
        } else {
            console.error("Error Message:", error.message);
        }

        // Try fallback to a known stable model if Mistral failed
        if (model.includes("mistral")) {
            console.log("\nAttempting fallback to 'google/gemini-2.0-flash-001'...");
            try {
                const response = await client.chat.completions.create({
                    model: "google/gemini-2.0-flash-001",
                    messages: [
                        { role: "user", content: "Say hello." }
                    ],
                    max_tokens: 10
                });
                console.log("✅ FALLBACK SUCCESS!");
                console.log("Response:", response.choices[0].message.content);
                console.log("💡 Suggestion: Update OPENROUTER_FAST_MODEL to a more reliable model.");
            } catch (fallbackError: any) {
                console.error("❌ FALLBACK FAILED:", fallbackError.message);
            }
        }
    }
}

testOpenRouter();
