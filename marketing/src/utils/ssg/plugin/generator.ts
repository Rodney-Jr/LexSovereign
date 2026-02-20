/**
 * SSG Generator for Plugin
 *
 * Generates static pages when called from the Vite plugin.
 * Directly calls the SSG generator (no subprocess).
 */

import type { ResolvedConfig } from "vite";
import type { ResolvedSsgPluginOptions } from "./types";
import type { GeneratedPage } from "./hosting";
import { generateStaticWithInfo } from "../gen-static";
import type { SsgBuildConfig } from "../types";

/**
 * Result from generating static pages
 */
export interface GenerateResult {
    /** List of generated pages with their metadata */
    pages: GeneratedPage[];
}

/**
 * Generate static pages for all configured page paths
 *
 * @param options - Resolved plugin options
 * @param _viteConfig - Resolved Vite configuration (for future use)
 * @returns Information about generated pages
 */
export async function generateStaticPages(
    options: ResolvedSsgPluginOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _viteConfig: ResolvedConfig
): Promise<GenerateResult> {
    // Merge plugin config with any Vite-derived settings
    const ssgConfig: SsgBuildConfig = {
        ...options.config,
        // Set log level based on verbose flag
        logLevel: options.verbose ? "debug" : (options.config.logLevel ?? "info"),
    };

    const allPages: GeneratedPage[] = [];

    // Process each page path
    for (const pagePath of options.pages) {
        if (options.verbose) {
            console.log(`[vite-plugin-ssg] Processing: ${pagePath}`);
        }

        const result = await generateStaticWithInfo(pagePath, ssgConfig);
        allPages.push(...result.pages);
    }

    return { pages: allPages };
}
