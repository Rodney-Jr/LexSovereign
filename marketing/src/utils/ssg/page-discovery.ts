/**
 * Page Discovery
 *
 * Discovers pages to generate from file or folder input.
 * Pages must export `ssgOptions` to be included.
 *
 * Uses static file parsing to extract ssgOptions metadata,
 * avoiding SSR module loading issues with CJS/ESM dependencies.
 */

import path from "node:path";
import fs from "node:fs";
import type { ResolvedSsgConfig } from "./types";

export interface ResolvedPageConfig {
    /** Absolute path to the page component file */
    componentPath: string;
    /** Output slug (e.g., "home" -> "home.html") */
    slug: string;
    /** Route URL for react-router */
    routeUrl: string;
    /** Whether the page has a Head component */
    hasHead: boolean;
    /** Whether the page has a context wrapper */
    hasContext: boolean;
}

/**
 * Parsed ssgOptions from static analysis
 */
interface ParsedSsgOptions {
    slug: string;
    routeUrl: string;
    hasHead: boolean;
    hasContext: boolean;
}

/**
 * Extract ssgOptions from file content using static parsing.
 * This avoids SSR module loading issues with CJS/ESM dependencies.
 */
function extractSsgOptionsFromFile(filePath: string): ParsedSsgOptions | null {
    try {
        const content = fs.readFileSync(filePath, "utf-8");

        // Look for ssgOptions export
        // Matches patterns like: export const ssgOptions: SsgOptions = { ... }
        // or: export const ssgOptions = { ... }
        const ssgOptionsMatch = content.match(
            /export\s+const\s+ssgOptions\s*(?::\s*\w+)?\s*=\s*\{([\s\S]*?)\n\};/
        );

        if (!ssgOptionsMatch) {
            return null;
        }

        const optionsContent = ssgOptionsMatch[1];

        // Extract slug (required)
        const slugMatch = optionsContent.match(/slug\s*:\s*["'`]([^"'`]+)["'`]/);
        if (!slugMatch) {
            return null;
        }

        const slug = slugMatch[1];

        // Extract routeUrl (optional, defaults to "/")
        const routeUrlMatch = optionsContent.match(/routeUrl\s*:\s*["'`]([^"'`]+)["'`]/);
        const routeUrl = routeUrlMatch ? routeUrlMatch[1] : "/";

        // Check for Head component (look for Head: or Head()
        const hasHead = /Head\s*:\s*(?:\(\)|[^,}])/.test(optionsContent) ||
                        /Head\s*\(\s*\)/.test(optionsContent);

        // Check for context wrapper
        const hasContext = /context\s*:\s*(?:async\s*)?\(/.test(optionsContent) ||
                          /context\s*:\s*\w+/.test(optionsContent);

        return {
            slug,
            routeUrl,
            hasHead,
            hasContext,
        };
    } catch (error) {
        console.warn(`[SSG] Failed to parse ${filePath}:`, error);
        return null;
    }
}

/**
 * Discover pages from a folder or single file
 *
 * @param input - Path to a file or folder
 * @param _config - Resolved SSG configuration (unused but kept for API compatibility)
 * @returns Array of resolved page configurations
 * @throws Error if single file doesn't have ssgOptions
 */
export async function discoverPages(
    input: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _config: ResolvedSsgConfig
): Promise<ResolvedPageConfig[]> {
    const absoluteInput = path.isAbsolute(input)
        ? input
        : path.join(process.cwd(), input);

    const stats = fs.statSync(absoluteInput);
    const pages: ResolvedPageConfig[] = [];

    if (stats.isFile()) {
        // Single file mode - error if no ssgOptions
        const ssgOptions = extractSsgOptionsFromFile(absoluteInput);

        if (!ssgOptions) {
            throw new Error(
                `File ${absoluteInput} does not export 'ssgOptions'. ` +
                `Single file input requires ssgOptions export.`
            );
        }

        pages.push({
            componentPath: absoluteInput,
            slug: ssgOptions.slug,
            routeUrl: ssgOptions.routeUrl,
            hasHead: ssgOptions.hasHead,
            hasContext: ssgOptions.hasContext,
        });
    } else if (stats.isDirectory()) {
        // Folder mode - scan for .tsx/.jsx files
        const files = fs
            .readdirSync(absoluteInput)
            .filter((f) => f.endsWith(".tsx") || f.endsWith(".jsx"))
            .map((f) => path.join(absoluteInput, f));

        console.log(`[SSG] Scanning ${files.length} files in ${absoluteInput}...`);

        for (const filePath of files) {
            const ssgOptions = extractSsgOptionsFromFile(filePath);

            if (ssgOptions) {
                pages.push({
                    componentPath: filePath,
                    slug: ssgOptions.slug,
                    routeUrl: ssgOptions.routeUrl,
                    hasHead: ssgOptions.hasHead,
                    hasContext: ssgOptions.hasContext,
                });
                console.log(
                    `[SSG] Found page: ${path.basename(filePath)} -> ${ssgOptions.slug}`
                );
            } else {
                console.warn(
                    `[SSG] Skipping ${path.basename(filePath)} (no ssgOptions export)`
                );
            }
        }
    } else {
        throw new Error(`Input ${absoluteInput} is neither a file nor a directory`);
    }

    return pages;
}
