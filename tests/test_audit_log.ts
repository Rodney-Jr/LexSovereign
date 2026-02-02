
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log("--- Static Analysis of Audit Log Constraints ---");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servicePath = path.join(__dirname, '../server/src/services/LexGeminiService.ts');

try {
    const content = fs.readFileSync(servicePath, 'utf-8');

    const requiredPhrases = [
        "You are an audit logging system",
        "Generate a clear, immutable audit description",
        "No opinions",
        "No assumptions",
        "Past tense",
        "Objective language",
        "Output: Single sentence audit_log_message only"
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
        console.log("\n✅ ALL AUDIT LOG SYSTEM PROMPTS VERIFIED.");
    } else {
        console.log("\n❌ FAIL: Audit log constraints missing.");
        process.exit(1);
    }
} catch (e: any) {
    console.error("Test Error:", e.message);
    process.exit(1);
}
