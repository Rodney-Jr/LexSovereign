
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log("--- Static Analysis of Safety Constraints ---");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjusted path to assume running from project root
// Since test is in /tests, we go up one level
const servicePath = path.join(__dirname, '../server/src/services/LexGeminiService.ts');

try {
    const content = fs.readFileSync(servicePath, 'utf-8');

    const requiredPhrases = [
        "Explain intent, not legal advice",
        "No jurisdiction-specific interpretation",
        "Keep explanation under 120 words",
        "Output plain English explanation only",
        "temperature: 0.1",
        "Explain this legal clause to a junior lawyer"
    ];

    let allPassed = true;
    requiredPhrases.forEach(phrase => {
        if (content.includes(phrase)) {
            console.log(`✅ PASS: Found safety rule: "${phrase}"`);
        } else {
            console.error(`❌ FAIL: Missing safety rule: "${phrase}"`);
            allPassed = false;
        }
    });

    if (allPassed) {
        console.log("\n✅ ALL SYSTEM PROMPT CONSTRAINTS VERIFIED.");
    } else {
        console.log("\n❌ FAIL: Safety constraints missing.");
        process.exit(1);
    }
} catch (e: any) {
    console.error("Test Error:", e.message);
    process.exit(1);
}
