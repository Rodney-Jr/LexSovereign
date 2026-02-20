/**
 * Dev Server Middleware
 *
 * Simulates hosting rewrites during development.
 * Serves static pages if they exist, or shows a helpful page if not yet generated.
 */

import type { Connect, ViteDevServer } from "vite";
import type { ResolvedSsgPluginOptions } from "./types";
import path from "node:path";
import fs from "node:fs";

/**
 * Information about a route that should have a static page
 */
interface StaticRoute {
    routeUrl: string;
    slug: string;
    htmlPath: string;
}

/**
 * Extract ssgOptions from file content using regex.
 * This is a lightweight approach that doesn't require SSR loading.
 */
function extractSsgOptionsFromFile(filePath: string): StaticRoute | null {
    try {
        const content = fs.readFileSync(filePath, "utf-8");

        // Look for ssgOptions export with slug and optional routeUrl
        // Matches patterns like: export const ssgOptions = { slug: "home", routeUrl: "/" }
        const ssgOptionsMatch = content.match(
            /export\s+const\s+ssgOptions\s*[=:][^{]*\{([^}]+)\}/s
        );

        if (!ssgOptionsMatch) {
            return null;
        }

        const optionsContent = ssgOptionsMatch[1];

        // Extract slug
        const slugMatch = optionsContent.match(/slug\s*:\s*["'`]([^"'`]+)["'`]/);
        if (!slugMatch) {
            return null;
        }

        const slug = slugMatch[1];

        // Extract routeUrl (optional, defaults to "/")
        const routeUrlMatch = optionsContent.match(/routeUrl\s*:\s*["'`]([^"'`]+)["'`]/);
        const routeUrl = routeUrlMatch ? routeUrlMatch[1] : "/";

        return {
            slug,
            routeUrl,
            htmlPath: `${slug}.html`,
        };
    } catch {
        return null;
    }
}

/**
 * Discover static routes from page files using static parsing.
 */
function discoverStaticRoutes(options: ResolvedSsgPluginOptions): StaticRoute[] {
    const routes: StaticRoute[] = [];

    for (const pagePath of options.pages) {
        const absolutePath = path.isAbsolute(pagePath)
            ? pagePath
            : path.join(process.cwd(), pagePath);

        if (!fs.existsSync(absolutePath)) {
            continue;
        }

        const stats = fs.statSync(absolutePath);

        if (stats.isFile()) {
            const route = extractSsgOptionsFromFile(absolutePath);
            if (route) {
                routes.push(route);
            }
        } else if (stats.isDirectory()) {
            const files = fs
                .readdirSync(absolutePath)
                .filter((f) => f.endsWith(".tsx") || f.endsWith(".jsx"))
                .map((f) => path.join(absolutePath, f));

            for (const filePath of files) {
                const route = extractSsgOptionsFromFile(filePath);
                if (route) {
                    routes.push(route);
                }
            }
        }
    }

    return routes;
}

/**
 * Generate HTML for "page not yet generated" message
 */
function generateNotGeneratedHtml(route: StaticRoute): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Static Page Not Generated</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 48px;
            backdrop-filter: blur(10px);
        }
        .icon {
            font-size: 64px;
            margin-bottom: 24px;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #fff;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #b0b0b0;
        }
        .route-info {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            text-align: left;
        }
        .route-info code {
            display: block;
            font-family: 'SF Mono', Monaco, 'Courier New', monospace;
            font-size: 14px;
            color: #7dd3fc;
            margin: 8px 0;
        }
        .label {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .command {
            background: #0f172a;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
            font-family: 'SF Mono', Monaco, 'Courier New', monospace;
            font-size: 14px;
            color: #4ade80;
            text-align: left;
        }
        .command::before {
            content: '$ ';
            color: #888;
        }
        .tip {
            font-size: 14px;
            color: #888;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🏗️</div>
        <h1>Static Page Not Yet Generated</h1>
        <p>
            This route is configured for static site generation,
            but the HTML file hasn't been built yet.
        </p>

        <div class="route-info">
            <div class="label">Route URL</div>
            <code>${route.routeUrl}</code>
            <div class="label" style="margin-top: 12px;">Expected File</div>
            <code>${route.htmlPath}</code>
        </div>

        <p>Run a production build to generate static pages:</p>

        <div class="command">npm run build</div>

        <p class="tip">
            💡 Tip: Static pages are only generated during production builds.
            In development, you're seeing this page because the SSG middleware
            detected this route should have a pre-rendered version.
        </p>
    </div>
</body>
</html>`;
}

/**
 * Get content type for a file based on extension
 */
function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".ico": "image/x-icon",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf",
        ".eot": "application/vnd.ms-fontobject",
    };
    return contentTypes[ext] || "application/octet-stream";
}

/**
 * Create middleware for Vite dev server that simulates hosting rewrites
 */
export function createDevMiddleware(
    options: ResolvedSsgPluginOptions
): (server: ViteDevServer) => void {
    return (server: ViteDevServer) => {
        // Cache for discovered routes (lazy-loaded on first request)
        let cachedRoutes: StaticRoute[] | null = null;

        const getRoutes = (): StaticRoute[] => {
            if (!cachedRoutes) {
                cachedRoutes = discoverStaticRoutes(options);
                if (options.verbose && cachedRoutes.length > 0) {
                    console.log(
                        `[SSG Dev] Discovered ${cachedRoutes.length} route(s): ${cachedRoutes.map((r) => r.routeUrl).join(", ")}`
                    );
                }
            }
            return cachedRoutes;
        };

        // Invalidate cache on file changes
        server.watcher.on("change", (filePath) => {
            if (filePath.endsWith(".tsx") || filePath.endsWith(".jsx")) {
                cachedRoutes = null;
            }
        });

        // Get the base URL path for static assets (e.g., "/static")
        const baseUrl = options.config.baseUrl || "/static";
        const outDir = options.config.outDir || "dist/static";

        const middleware: Connect.NextHandleFunction = (req, res, next) => {
            const url = req.url?.split("?")[0] || "/";

            // Skip Vite internal requests
            if (url.startsWith("/@") || url.startsWith("/__")) {
                return next();
            }

            // Handle static assets from the SSG output directory
            // e.g., /static/home.css -> dist/static/home.css
            if (url.startsWith(baseUrl + "/")) {
                const relativePath = url.slice(baseUrl.length + 1);
                const filePath = path.join(process.cwd(), outDir, relativePath);

                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    const contentType = getContentType(filePath);
                    const content = fs.readFileSync(filePath);

                    res.setHeader("Content-Type", contentType);
                    res.setHeader("X-SSG-Dev-Middleware", "asset");
                    res.setHeader("Cache-Control", "no-cache");
                    res.end(content);
                    return;
                }
            }

            // Skip other asset requests (let Vite handle them)
            if (
                url.match(/\.(js|ts|tsx|jsx|css|scss|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/)
            ) {
                return next();
            }

            try {
                const routes = getRoutes();

                // Find matching route
                const matchingRoute = routes.find((r) => {
                    // Exact match
                    if (r.routeUrl === url) return true;
                    // Match with trailing slash
                    if (r.routeUrl === "/" && url === "/") return true;
                    if (url === r.routeUrl + "/" || url + "/" === r.routeUrl) return true;
                    return false;
                });

                if (!matchingRoute) {
                    return next();
                }

                // Check if static file exists
                const staticFilePath = path.join(
                    process.cwd(),
                    outDir,
                    matchingRoute.htmlPath
                );

                if (fs.existsSync(staticFilePath)) {
                    // Serve the static file
                    if (options.verbose) {
                        console.log(`[SSG Dev] Serving static: ${matchingRoute.htmlPath}`);
                    }

                    const content = fs.readFileSync(staticFilePath, "utf-8");
                    res.setHeader("Content-Type", "text/html");
                    res.setHeader("X-SSG-Dev-Middleware", "static");
                    res.end(content);
                    return;
                }

                // Static file doesn't exist - show helpful page
                if (options.verbose) {
                    console.log(`[SSG Dev] Static not found: ${matchingRoute.htmlPath}`);
                }

                const html = generateNotGeneratedHtml(matchingRoute);
                res.setHeader("Content-Type", "text/html");
                res.setHeader("X-SSG-Dev-Middleware", "not-generated");
                res.statusCode = 200;
                res.end(html);
            } catch (error) {
                console.error("[SSG Dev] Middleware error:", error);
                next();
            }
        };

        // Add middleware at the start of the stack
        server.middlewares.use(middleware);

        if (options.verbose) {
            console.log("[SSG Dev] Middleware installed - simulating hosting rewrites");
            console.log(`[SSG Dev] Serving static assets from ${baseUrl}/ -> ${outDir}/`);
        }
    };
}
