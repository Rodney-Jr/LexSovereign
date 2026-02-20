/**
 * Static Site Generator
 *
 * Main entry point for generating static HTML pages from React components.
 *
 * Usage:
 *   npx tsx src/static-gen/gen-static.ts <file-or-folder>
 *
 * Examples:
 *   npx tsx src/static-gen/gen-static.ts src/pages/HomePage.tsx
 *   npx tsx src/static-gen/gen-static.ts src/pages/
 */

import path from "node:path";
import fs from "node:fs";

import { discoverPages, type ResolvedPageConfig } from "./page-discovery";
import { scanForIslands } from "./island-scanner";
import { renderPage } from "./ssr-renderer";
import { optimizeImages, generateImagePreloads } from "./image-optimizer";
import { buildCssBundle } from "./css-builder";
import { buildHydrationBundle } from "./hydration-builder";
import { generateHtmlTemplate } from "./html-template";
import { resolveConfig } from "./config";
import type { SsgBuildConfig, ResolvedSsgConfig } from "./types";

/**
 * Generate a single static page
 */
async function generateStaticPage(
    pageConfig: ResolvedPageConfig,
    ssgConfig: ResolvedSsgConfig
): Promise<void> {
    const { componentPath, slug, routeUrl, hasHead } = pageConfig;
    const srcDir = path.join(process.cwd(), ssgConfig.srcDir);
    const outputDir = path.join(process.cwd(), ssgConfig.outDir);

    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Step 1: Scan for islands
    console.log(`[${slug}] Scanning for islands...`);
    const islands = scanForIslands(componentPath, srcDir);

    if (islands.length > 0) {
        console.log(`[${slug}] Found ${islands.length} island(s): ${islands.map((i) => i.name).join(", ")}`);
    } else {
        console.log(`[${slug}] No islands found`);
    }

    // Step 2: Render HTML using SSR
    console.log(`[${slug}] Rendering HTML...`);
    const { bodyHtml, headHtml } = await renderPage({
        componentPath,
        routeUrl,
        islands,
        renderHead: hasHead,
        config: ssgConfig,
    });

    // Step 3: Optimize images (if enabled)
    let optimizedBodyHtml = bodyHtml;
    let imagePreloadTags = "";

    if (ssgConfig.images.enabled) {
        console.log(`[${slug}] Optimizing images...`);
        const { html, images: optimizedImages } = await optimizeImages(
            bodyHtml,
            {
                outputDir,
                baseUrl: ssgConfig.baseUrl,
                formats: ssgConfig.images.formats,
                quality: ssgConfig.images.quality,
                generateSrcset: ssgConfig.images.generateSrcset,
                srcsetMultipliers: ssgConfig.images.srcsetMultipliers,
            }
        );
        optimizedBodyHtml = html;
        imagePreloadTags = generateImagePreloads(optimizedImages, ssgConfig.images.lcpImageCount);
    }

    // Step 4: Build CSS bundle
    console.log(`[${slug}] Building CSS bundle...`);
    const { cssPath } = await buildCssBundle({
        componentPath,
        slug,
        config: ssgConfig,
    });
    console.log(`[${slug}] CSS bundle created`);

    // Step 5: Build hydration bundle (if islands exist)
    let hydratePath: string | null = null;
    if (islands.length > 0) {
        console.log(`[${slug}] Building hydration bundle...`);
        const result = await buildHydrationBundle({
            slug,
            islands,
            config: ssgConfig,
        });
        hydratePath = result.hydratePath;
        console.log(`[${slug}] Hydration bundle created`);
    }

    // Step 6: Generate final HTML
    const finalHtml = generateHtmlTemplate({
        headContent: headHtml,
        bodyContent: optimizedBodyHtml,
        cssPath,
        hydrateJsPath: hydratePath,
        routeUrl,
        imagePreloadTags,
        config: ssgConfig,
    });

    // Write output file
    const outputPath = path.join(outputDir, `${slug}.html`);
    fs.writeFileSync(outputPath, finalHtml);
    console.log(`[${slug}] Static page generated: ${ssgConfig.outDir}/${slug}.html`);
}

/**
 * Information about a generated page (for hosting configuration)
 */
export interface GeneratedPageInfo {
    slug: string;
    routeUrl: string;
    htmlPath: string;
}

/**
 * Result from generateStaticWithInfo
 */
export interface GenerateStaticResult {
    pages: GeneratedPageInfo[];
}

/**
 * Generate static pages from file or folder input
 *
 * @param input - Path to a file or folder containing pages
 * @param userConfig - Optional build configuration
 * @returns Promise that resolves when all pages are generated
 *
 * @example
 * ```typescript
 * import { generateStatic } from './static-gen/gen-static';
 *
 * // With defaults
 * await generateStatic('src/pages/');
 *
 * // With custom config
 * await generateStatic('src/pages/', {
 *   outDir: 'dist/static',
 *   baseUrl: '/static',
 *   images: { quality: 90 },
 *   js: { minify: 'esbuild' },
 * });
 * ```
 */
export async function generateStatic(
    input: string,
    userConfig: SsgBuildConfig = {}
): Promise<void> {
    await generateStaticWithInfo(input, userConfig);
}

/**
 * Generate static pages and return information about generated pages
 *
 * This is used by the Vite plugin to configure hosting platforms.
 *
 * @param input - Path to a file or folder containing pages
 * @param userConfig - Optional build configuration
 * @returns Information about generated pages
 */
export async function generateStaticWithInfo(
    input: string,
    userConfig: SsgBuildConfig = {}
): Promise<GenerateStaticResult> {

    const config = resolveConfig(userConfig);

    // Discover pages to generate
    const pages = await discoverPages(input, config);

    if (pages.length === 0) {
        throw new Error("No pages found to generate");
    }

    console.log(`[SSG] Generating ${pages.length} static page(s)...`);

    const generatedPages: GeneratedPageInfo[] = [];

    // Generate each page
    for (const pageConfig of pages) {
        await generateStaticPage(pageConfig, config);

        generatedPages.push({
            slug: pageConfig.slug,
            routeUrl: pageConfig.routeUrl,
            htmlPath: `${pageConfig.slug}.html`,
        });
    }

    console.log("[SSG] Done!");

    return { pages: generatedPages };
}

