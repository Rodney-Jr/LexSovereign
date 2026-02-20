/**
 * SSR Renderer
 *
 * Renders React components to static HTML using Vite's SSR capabilities.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { IslandInfo } from "./island-scanner";
import type { ResolvedSsgConfig } from "./types";
import { toViteLogLevel } from "./config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use createRequire to resolve plugins from the project root (not from this package)
// This ensures we use the project's vite/plugins, not the package's copies
const require = createRequire(path.join(process.cwd(), "package.json"));
const { createServer } = require("vite");
const reactPlugin = require("@vitejs/plugin-react").default;
const tailwindcss = require("@tailwindcss/vite").default;

export interface RenderOptions {
    /** Absolute path to the page component */
    componentPath: string;
    /** Route URL for react-router StaticRouter */
    routeUrl: string;
    /** Islands to load for SSR */
    islands: IslandInfo[];
    /** Whether to render the Head component */
    renderHead: boolean;
    /** Resolved SSG configuration */
    config: ResolvedSsgConfig;
}

export interface RenderResult {
    /** Rendered body HTML */
    bodyHtml: string;
    /** Rendered head HTML (meta tags, title, etc.) */
    headHtml: string;
}

/**
 * Render a page component to static HTML
 *
 * Uses Vite's SSR mode to load and render the component
 * with all islands pre-rendered.
 */
export async function renderPage(options: RenderOptions): Promise<RenderResult> {
    const { componentPath, routeUrl, islands, renderHead: shouldRenderHead, config } = options;

    // Get the path to server-entry.tsx from this package's src folder
    // __dirname is dist/, but we need src/ for the tsx source file (loaded by Vite SSR)
    const serverEntryPath = path.join(__dirname, "..", "src", "server-entry.tsx");

    // Create Vite server for SSR
    const vite = await createServer({
        configFile: false, // Don't load vite.config.ts
        root: process.cwd(), // Use project's root to resolve node_modules
        plugins: [reactPlugin(), tailwindcss(), ...config.vite.plugins],
        appType: "custom",
        logLevel: toViteLogLevel(config.logLevel),
        ssr: {
            external: ['sharp', 'fsevents'],
        },
    });

    try {
        // Load the SSR entry module from the package
        const { render, renderHead } = await vite.ssrLoadModule(serverEntryPath);

        // Render body content
        const bodyHtml = await render(componentPath, routeUrl, islands);

        // Render head content if requested
        let headHtml = "";
        if (shouldRenderHead) {
            headHtml = await renderHead(componentPath);
        }

        return { bodyHtml, headHtml };
    } finally {
        await vite.close();
    }
}
