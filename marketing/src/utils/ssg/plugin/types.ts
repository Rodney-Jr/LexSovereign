/**
 * Vite SSG Plugin Types
 *
 * Configuration types for the Vite Static Site Generation plugin.
 */

import type { SsgBuildConfig } from "../types";

/**
 * Hosting platform configuration
 */
export interface HostingConfig {
    /**
     * Path to firebase.json file.
     * When provided, the plugin will update Firebase hosting rewrites
     * to serve static pages at their configured routes.
     *
     * @example "../firebase.json"
     */
    firebaseJson?: string;
}

/**
 * Plugin options for vite-plugin-ssg
 *
 * @example
 * ```typescript
 * import { ssgPlugin } from './static-gen/plugin';
 *
 * export default defineConfig({
 *   plugins: [
 *     ssgPlugin({
 *       // Required: pages to generate
 *       pages: 'src/pages/HomePage.tsx',
 *       // or folder
 *       pages: 'src/pages/',
 *       // or array
 *       pages: ['src/pages/HomePage.tsx', 'src/pages/AboutPage.tsx'],
 *
 *       // Optional: SSG build configuration
 *       config: {
 *         outDir: 'dist/static',
 *         baseUrl: '/static',
 *         images: { quality: 90 },
 *       },
 *
 *       // Optional: Hosting platform configuration
 *       hosting: {
 *         firebaseJson: '../firebase.json',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export interface SsgPluginOptions {
    /**
     * Pages to generate static HTML for.
     * Can be a single file path, folder path, or array of paths.
     *
     * - File path: Generate static HTML for that specific page
     * - Folder path: Scan folder for files with `ssgOptions` export
     * - Array: Process multiple files/folders
     *
     * Paths are relative to the project root.
     */
    pages: string | string[];

    /**
     * SSG build configuration options.
     * These override the defaults for image optimization, CSS/JS minification, etc.
     */
    config?: SsgBuildConfig;

    /**
     * Hosting platform configuration.
     * Configure rewrites/redirects for your hosting platform.
     */
    hosting?: HostingConfig;

    /**
     * Whether to run SSG during development builds.
     * @default false
     */
    runInDev?: boolean;

    /**
     * Enable dev server middleware to simulate hosting rewrites.
     * When enabled, the dev server will serve static pages if they exist,
     * or show a helpful message if they haven't been generated yet.
     * @default true
     */
    devMiddleware?: boolean;

    /**
     * Enable verbose logging
     * @default false
     */
    verbose?: boolean;
}

/**
 * Internal resolved options with defaults applied
 */
export interface ResolvedSsgPluginOptions {
    pages: string[];
    config: SsgBuildConfig;
    hosting?: HostingConfig;
    runInDev: boolean;
    devMiddleware: boolean;
    verbose: boolean;
}
