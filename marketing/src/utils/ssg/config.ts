/**
 * SSG Configuration
 *
 * Default configuration and resolver for merging user config with defaults.
 */

import type { LogLevel } from "vite";
import type { SsgBuildConfig, ResolvedSsgConfig } from "./types";

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: ResolvedSsgConfig = {
    outDir: "dist/static",
    baseUrl: "/static",
    srcDir: "src",
    vite: {
        plugins: [],
    },
    images: {
        enabled: true,
        formats: ["webp"],
        quality: 80,
        generateSrcset: true,
        srcsetMultipliers: [1, 2],
        lcpImageCount: 4,
    },
    css: {
        minify: "lightningcss",
        globalCssPath: "src/index.css",
    },
    js: {
        minify: "terser",
        target: "es2020",
        terserOptions: {
            dropConsole: true,
            dropDebugger: true,
            passes: 2,
        },
    },
    html: {
        headTags: "",
        bodyTags: "",
        lang: "en",
    },
    logLevel: "info",
};

/**
 * Deep merge two objects, with source values taking precedence
 */
function deepMerge(
    target: ResolvedSsgConfig,
    source: SsgBuildConfig
): ResolvedSsgConfig {
    const result = { ...target };

    for (const key of Object.keys(source) as (keyof SsgBuildConfig)[]) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (sourceValue === undefined) {
            continue;
        }

        if (
            typeof sourceValue === "object" &&
            sourceValue !== null &&
            !Array.isArray(sourceValue) &&
            typeof targetValue === "object" &&
            targetValue !== null &&
            !Array.isArray(targetValue)
        ) {
            // Recursively merge nested objects
            (result as Record<string, unknown>)[key] = {
                ...targetValue,
                ...sourceValue,
            };
        } else {
            // Override with source value
            (result as Record<string, unknown>)[key] = sourceValue;
        }
    }

    return result;
}

/**
 * Resolve user configuration by merging with defaults
 *
 * @param userConfig - Partial user configuration
 * @returns Fully resolved configuration with all defaults applied
 */
export function resolveConfig(userConfig: SsgBuildConfig = {}): ResolvedSsgConfig {
    return deepMerge(DEFAULT_CONFIG, userConfig);
}

/**
 * Map log level to Vite log level
 * Vite doesn't have 'debug', so we map it to 'info'
 */
export function toViteLogLevel(
    level: ResolvedSsgConfig["logLevel"]
): LogLevel {
    if (level === "debug") {
        return "info";
    }
    return level;
}
