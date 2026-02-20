/**
 * Vite SSG Plugin
 *
 * A Vite plugin for generating static HTML pages from React components.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import react from '@vitejs/plugin-react';
 * import { ssgPlugin } from './src/static-gen/plugin';
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     ssgPlugin({
 *       pages: 'src/pages/',
 *       config: {
 *         outDir: 'dist/static',
 *         baseUrl: '/static',
 *       },
 *       hosting: {
 *         firebaseJson: '../firebase.json',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */

import type { Plugin, ResolvedConfig } from "vite";
import type { SsgPluginOptions, ResolvedSsgPluginOptions } from "./types";
import { generateStaticPages } from "./generator";
import { createFirebaseConfigurator } from "./hosting";
import { createDevMiddleware } from "./dev-middleware";

const PLUGIN_NAME = "vite-plugin-ssg";

/**
 * Resolve plugin options with defaults
 */
function resolvePluginOptions(options: SsgPluginOptions): ResolvedSsgPluginOptions {
    const pages = Array.isArray(options.pages) ? options.pages : [options.pages];

    return {
        pages,
        config: options.config ?? {},
        hosting: options.hosting,
        runInDev: options.runInDev ?? false,
        devMiddleware: options.devMiddleware ?? true, // Enabled by default
        verbose: options.verbose ?? false,
    };
}

/**
 * Create the Vite SSG plugin
 *
 * This plugin generates static HTML pages during the build process
 * using the `writeBundle` hook, which runs after files are written to disk.
 *
 * @param options - Plugin configuration options
 * @returns Vite plugin object
 */
export function ssgPlugin(options: SsgPluginOptions): Plugin {
    const resolvedOptions = resolvePluginOptions(options);
    let viteConfig: ResolvedConfig;
    let isBuild = false;
    let hasRun = false; // Prevent running multiple times

    return {
        name: PLUGIN_NAME,

        // Run after other build plugins
        enforce: "post",

        // Always apply - middleware runs in dev, SSG runs in build
        apply() {
            return true;
        },

        /**
         * Store the resolved Vite config for later use
         */
        configResolved(config) {
            viteConfig = config;
            isBuild = config.command === "build";

            if (resolvedOptions.verbose) {
                console.log(`[${PLUGIN_NAME}] Config resolved, command: ${config.command}`);
            }
        },

        /**
         * Configure dev server middleware to simulate hosting rewrites.
         * This allows testing static page routing during development.
         */
        configureServer: resolvedOptions.devMiddleware
            ? createDevMiddleware(resolvedOptions)
            : undefined,

        /**
         * Generate static pages after the bundle is written to disk.
         * We use writeBundle because:
         * 1. All assets are already written to disk
         * 2. We can run our own Vite SSR server without conflicts
         */
        async writeBundle() {
            // Skip if not a build or already run
            if (!isBuild || hasRun) {
                return;
            }

            hasRun = true;

            console.log(`[${PLUGIN_NAME}] Generating static pages...`);

            const startTime = Date.now();

            try {
                const result = await generateStaticPages(resolvedOptions, viteConfig);

                // Configure hosting platform if specified
                if (resolvedOptions.hosting?.firebaseJson) {
                    const configurator = createFirebaseConfigurator(
                        resolvedOptions.hosting.firebaseJson
                    );
                    const baseUrl = resolvedOptions.config.baseUrl ?? "/static";
                    await configurator.configure(result.pages, baseUrl);
                }

                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`[${PLUGIN_NAME}] Static pages generated in ${duration}s`);
            } catch (error) {
                console.error(`[${PLUGIN_NAME}] Error generating static pages:`, error);
                throw error;
            }
        },
    };
}

// Re-export types for consumers
export type { SsgPluginOptions, HostingConfig } from "./types";
