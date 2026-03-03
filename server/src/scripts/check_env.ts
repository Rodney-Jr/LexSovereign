
import dotenv from 'dotenv';
import path from 'path';

// Load env from the same place the server does
dotenv.config();

console.log("--- Server Environment Diagnostic ---");
console.log("CWD:", process.cwd());
console.log("AI_PROVIDER:", process.env.AI_PROVIDER);
console.log("OPENROUTER_MODEL:", process.env.OPENROUTER_MODEL);
console.log("OPENROUTER_FAST_MODEL:", process.env.OPENROUTER_FAST_MODEL);
console.log("GEMINI_MODEL:", process.env.GEMINI_MODEL);
console.log("OPENAI_MODEL:", process.env.OPENAI_MODEL);

const allModelVars = Object.keys(process.env).filter(key => key.includes("MODEL") || key.includes("AI"));
console.log("\nAll Model/AI related env vars found:");
allModelVars.forEach(key => {
    console.log(`${key}=${process.env[key]}`);
});
