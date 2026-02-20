/**
 * Hydration Builder
 *
 * Builds JavaScript bundles for hydrating island components.
 */

import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import { generateHydrationScript, type IslandInfo } from "./island-scanner";
import type { ResolvedSsgConfig } from "./types";
import { toViteLogLevel } from "./config";

// Use createRequire to resolve plugins from the project root (not from this package)
// This ensures we use the project's vite/plugins, not the package's copies
const require = createRequire(path.join(process.cwd(), "package.json"));
const { build } = require("vite");
const reactPlugin = require("@vitejs/plugin-react").default;
const tailwindcss = require("@tailwindcss/vite").default;

export interface HydrationBuildOptions {
    /** Output slug for naming the hydration file */
    slug: string;
    /** Islands to hydrate */
    islands: IslandInfo[];
    /** Resolved SSG configuration */
    config: ResolvedSsgConfig;
}

export interface HydrationBuildResult {
    /** Path to the hydration JS file, or null if no islands */
    hydratePath: string | null;
}

/**
 * Build the hydration bundle for island components
 *
 * Generates a dynamic entry script that imports and hydrates
 * only the detected island components.
 */
export async function buildHydrationBundle(
    options: HydrationBuildOptions
): Promise<HydrationBuildResult> {
    const { slug, islands, config } = options;
    const outputDir = path.join(process.cwd(), config.outDir);

    // No islands = no hydration needed
    if (islands.length === 0) {
        return { hydratePath: null };
    }

    // Generate the hydration entry script in a temp directory
    const hydrateScript = generateHydrationScript(islands);
    const tempDir = path.join(process.cwd(), "node_modules", ".vite-plugin-ssg");
    fs.mkdirSync(tempDir, { recursive: true });
    const hydrateEntryPath = path.join(tempDir, `_temp_${slug}_hydrate.tsx`);

    fs.writeFileSync(hydrateEntryPath, hydrateScript);

    try {
        // Combine default plugins with user plugins
        const plugins = [
            reactPlugin(),
            tailwindcss(),
            ...config.vite.plugins,
        ];

        // Build terser options from config
        const terserOptions = config.js.minify === "terser"
            ? {
                compress: {
                    drop_console: config.js.terserOptions.dropConsole,
                    drop_debugger: config.js.terserOptions.dropDebugger,
                    passes: config.js.terserOptions.passes,
                },
                mangle: true,
                format: {
                    comments: false,
                },
            }
            : undefined;

        await build({
            configFile: false, // Don't load vite.config.ts
            root: process.cwd(), // Use project's root to resolve node_modules
            plugins,
            build: {
                outDir: outputDir,
                emptyOutDir: false,
                rollupOptions: {
                    input: hydrateEntryPath,
                    output: {
                        entryFileNames: `${slug}-hydrate.js`,
                        chunkFileNames: `${slug}-hydrate-[hash].js`,
                        assetFileNames: `${slug}-hydrate.[ext]`,
                    },
                    external: ['sharp', 'fsevents'],
                    treeshake: {
                        moduleSideEffects: false,
                    },
                },
                minify: config.js.minify,
                terserOptions,
                target: config.js.target,
            },
            logLevel: toViteLogLevel(config.logLevel),
        });

        return {
            hydratePath: `${config.baseUrl}/${slug}-hydrate.js`,
        };
    } finally {
        // Clean up temp file
        if (fs.existsSync(hydrateEntryPath)) {
            fs.unlinkSync(hydrateEntryPath);
        }
    }
}
