
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log("--- Static Analysis of Pricing Mapper ---");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servicePath = path.join(__dirname, '../server/src/services/LexGeminiService.ts');

try {
    const content = fs.readFileSync(servicePath, 'utf-8');

    const requiredPhrases = [
        "You are designing pricing tiers for a Legal Ops SaaS",
        "Propose Free, Pro, and Enterprise tiers",
        "Assign features logically",
        "Avoid feature cannibalization",
        "Ensure Free tier demonstrates value but enforces limits"
    ];

    let allPassed = true;
    requiredPhrases.forEach(phrase => {
        if (content.includes(phrase)) {
            console.log(`✅ PASS: Found rule: "${phrase}"`);
        } else {
            console.error(`❌ FAIL: Missing rule: "${phrase}"`);
            allPassed = false;
        }
    });

    if (allPassed) {
        console.log("\n✅ ALL PRICING MAPPER PROMPTS VERIFIED.");
    } else {
        console.log("\n❌ FAIL: Pricing constraints missing.");
        process.exit(1);
    }
} catch (e: any) {
    console.error("Test Error:", e.message);
    process.exit(1);
}
