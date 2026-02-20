/**
 * CSS Builder
 *
 * Builds optimized CSS bundles for static pages using Vite.
 */

import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import type { ResolvedSsgConfig } from "./types";
import { toViteLogLevel } from "./config";

// Use createRequire to resolve plugins from the project root (not from this package)
// This ensures we use the project's vite/plugins, not the package's copies
const require = createRequire(path.join(process.cwd(), "package.json"));
const { build } = require("vite");
const reactPlugin = require("@vitejs/plugin-react").default;
const tailwindcss = require("@tailwindcss/vite").default;

export interface CssBuildOptions {
    /** Absolute path to the page component */
    componentPath: string;
    /** Output slug for naming the CSS file */
    slug: string;
    /** Resolved SSG configuration */
    config: ResolvedSsgConfig;
}

export interface CssBuildResult {
    /** Path to the generated CSS file, or null if none generated */
    cssPath: string | null;
}

/**
 * Build an optimized CSS bundle for a page
 *
 * Creates a temporary entry file that imports the page and CSS,
 * builds it with Vite, then extracts only the CSS.
 */
export async function buildCssBundle(options: CssBuildOptions): Promise<CssBuildResult> {
    const { componentPath, slug, config } = options;
    const outputDir = path.join(process.cwd(), config.outDir);

    // Create temp entry file that imports page + global CSS
    const tempDir = path.join(process.cwd(), "node_modules", ".vite-plugin-ssg");
    fs.mkdirSync(tempDir, { recursive: true });
    const tempEntryPath = path.join(tempDir, `_temp_${slug}_entry.tsx`);

    // Calculate relative path from temp entry to component
    const relativePath = path.relative(path.dirname(tempEntryPath), componentPath);

    // Calculate relative path to global CSS
    const globalCssAbsolute = path.join(process.cwd(), config.css.globalCssPath);
    const globalCssRelative = path.relative(path.dirname(tempEntryPath), globalCssAbsolute);

    const tempEntryContent = `
        import '${globalCssRelative}';
        import '${relativePath}';
    `;

    fs.writeFileSync(tempEntryPath, tempEntryContent);

    try {
        // Combine default plugins with user plugins
        const plugins = [
            reactPlugin(),
            tailwindcss(),
            ...config.vite.plugins,
        ];

        await build({
            configFile: false, // Don't load vite.config.ts
            root: process.cwd(), // Use project's root to resolve node_modules
            plugins,
            build: {
                outDir: outputDir,
                emptyOutDir: false,
                rollupOptions: {
                    input: tempEntryPath,
                    output: {
                        entryFileNames: `${slug}.js`,
                        chunkFileNames: `${slug}-[hash].js`,
                        assetFileNames: `${slug}.[ext]`,
                    },
                    external: ['sharp', 'fsevents'],
                },
                cssCodeSplit: false,
                cssMinify: config.css.minify,
                minify: true,
            },
            logLevel: toViteLogLevel(config.logLevel),
        });

        // Delete the JS files, keep only CSS
        const files = fs.readdirSync(outputDir);
        for (const file of files) {
            if (file.endsWith(".js") && !file.includes("hydrate")) {
                fs.unlinkSync(path.join(outputDir, file));
            }
        }

        // Check if CSS was generated
        const cssFileName = `${slug}.css`;
        const cssExists = fs.existsSync(path.join(outputDir, cssFileName));

        return {
            cssPath: cssExists ? `${config.baseUrl}/${cssFileName}` : null,
        };
    } finally {
        // Clean up temp file
        if (fs.existsSync(tempEntryPath)) {
            fs.unlinkSync(tempEntryPath);
        }
    }
}
