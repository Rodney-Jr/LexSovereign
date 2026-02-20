#!/usr/bin/env npx tsx
/**
 * SSG CLI
 *
 * Command-line interface for generating static HTML pages.
 *
 * Usage:
 *   npx tsx src/static-gen/cli.ts <file-or-folder>
 *
 * Examples:
 *   npx tsx src/static-gen/cli.ts src/pages/HomePage.tsx
 *   npx tsx src/static-gen/cli.ts src/pages/
 */

import { generateStatic } from "./gen-static";

async function main(): Promise<void> {
    const input = process.argv[2];

    if (!input) {
        console.error("Usage: npx tsx src/static-gen/cli.ts <file-or-folder>");
        console.error("");
        console.error("Examples:");
        console.error("  npx tsx src/static-gen/cli.ts src/pages/HomePage.tsx");
        console.error("  npx tsx src/static-gen/cli.ts src/pages/");
        process.exit(1);
    }

    try {
        await generateStatic(input);
    } catch (error) {
        console.error("[SSG] Error:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();
