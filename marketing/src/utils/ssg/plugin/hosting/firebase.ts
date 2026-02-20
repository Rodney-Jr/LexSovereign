/**
 * Firebase Hosting Configurator
 *
 * Modifies firebase.json to add rewrites for static pages.
 */

import fs from "node:fs";
import path from "node:path";
import type { GeneratedPage, HostingConfigurator } from "./types";

/**
 * Firebase rewrite rule
 */
interface FirebaseRewrite {
    source: string;
    destination?: string;
    function?: string;
    run?: { serviceId: string };
}

/**
 * Firebase hosting configuration
 */
interface FirebaseHostingConfig {
    public?: string;
    ignore?: string[];
    rewrites?: FirebaseRewrite[];
    redirects?: unknown[];
    headers?: unknown[];
    cleanUrls?: boolean;
    trailingSlash?: boolean;
}

/**
 * Firebase configuration file structure
 */
interface FirebaseConfig {
    hosting?: FirebaseHostingConfig | FirebaseHostingConfig[];
    [key: string]: unknown;
}

/**
 * Check if a rewrite is an SSG-managed rewrite by its destination pattern
 */
function isSsgRewrite(rewrite: FirebaseRewrite, baseUrl: string): boolean {
    return !!(
        rewrite.destination &&
        rewrite.destination.startsWith(baseUrl + "/") &&
        rewrite.destination.endsWith(".html")
    );
}

/**
 * Create a Firebase hosting configurator
 *
 * @param firebaseJsonPath - Path to firebase.json file
 * @returns HostingConfigurator instance
 */
export function createFirebaseConfigurator(firebaseJsonPath: string): HostingConfigurator {
    const absolutePath = path.isAbsolute(firebaseJsonPath)
        ? firebaseJsonPath
        : path.join(process.cwd(), firebaseJsonPath);

    return {
        name: "firebase",

        async configure(pages: GeneratedPage[], baseUrl: string): Promise<void> {
            // Read existing firebase.json
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`Firebase config not found: ${absolutePath}`);
            }

            const content = fs.readFileSync(absolutePath, "utf-8");
            const config: FirebaseConfig = JSON.parse(content);

            // Get hosting config (could be object or array)
            let hostingConfig: FirebaseHostingConfig;
            if (Array.isArray(config.hosting)) {
                // Use first hosting config if multiple
                hostingConfig = config.hosting[0];
            } else if (config.hosting) {
                hostingConfig = config.hosting;
            } else {
                throw new Error("No hosting configuration found in firebase.json");
            }

            // Initialize rewrites array if not present
            if (!hostingConfig.rewrites) {
                hostingConfig.rewrites = [];
            }

            // Remove existing SSG-managed rewrites (identified by destination pattern)
            const existingRewrites = hostingConfig.rewrites.filter(
                (r) => !isSsgRewrite(r, baseUrl)
            );

            // Create new SSG rewrites
            const ssgRewrites: FirebaseRewrite[] = pages.map((page) => ({
                source: page.routeUrl === "/" ? "/" : page.routeUrl,
                destination: `${baseUrl}/${page.slug}.html`,
            }));

            // Find the catch-all rewrite index (usually "**" -> "/index.html")
            const catchAllIndex = existingRewrites.findIndex(
                (r) => r.source === "**" || r.source === "/**"
            );

            // Insert SSG rewrites before the catch-all, or at the beginning
            let newRewrites: FirebaseRewrite[];
            if (catchAllIndex >= 0) {
                newRewrites = [
                    ...existingRewrites.slice(0, catchAllIndex),
                    ...ssgRewrites,
                    ...existingRewrites.slice(catchAllIndex),
                ];
            } else {
                // No catch-all found, prepend SSG rewrites
                newRewrites = [...ssgRewrites, ...existingRewrites];
            }

            // Update the config
            hostingConfig.rewrites = newRewrites;

            // Write back to file with nice formatting
            const output = JSON.stringify(config, null, 2);
            fs.writeFileSync(absolutePath, output + "\n");

            console.log(
                `[SSG] Updated firebase.json with ${ssgRewrites.length} rewrite(s)`
            );
        },
    };
}
