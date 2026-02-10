
import * as dotenv from 'dotenv';
import * as path from 'path';

// Calculate path to .env (assuming script is in src/scripts and .env is in server/)
const envPath = path.resolve(__dirname, '../../.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

const envLocalPath = path.resolve(__dirname, '../../.env.local');
console.log(`Loading .env.local from: ${envLocalPath}`);
dotenv.config({ path: envLocalPath, override: true });

import { LexAIService } from '../services/LexAIService';

async function verifyExplainClause() {
    console.log("---------------------------------------------------");
    console.log("Verifying Explain Clause Integration");

    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ GEMINI_API_KEY not found in .env. Skipping AI verification.");
        return;
    }

    const service = new LexAIService();
    const clauseText = "The Indemnifying Party shall indemnify, defend, and hold harmless the Indemnified Party from and against any and all Losses arising out of or resulting from any third-party claim.";

    console.log(`Explaining clause: "${clauseText}"`);

    try {
        // Direct Service Call Verification
        console.log("1. Testing Service Method Directly...");
        const explanation = await service.explainClause(clauseText);
        console.log("Service Response:", explanation);

        if (explanation && explanation.length > 10) {
            console.log("✅ Service Method Verification Passed");
        } else {
            console.error("❌ Service Method returned empty or short response");
        }

        // Check if environment variables for server are set to test API (Optional, simplistic check here)
        // ideally we would spin up the server and fetch, but direct service check confirms logic + key.
        // We rely on the route implementation being correct as per standard express patterns.

    } catch (e: any) {
        console.error("❌ Verification failed:", e.message);
    }
    console.log("---------------------------------------------------");
}

verifyExplainClause();
