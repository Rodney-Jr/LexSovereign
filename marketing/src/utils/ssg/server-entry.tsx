import React, { Suspense, ComponentType, ReactNode } from "react"
import { prerenderToNodeStream } from "react-dom/static"
import ReactDOMServer from "react-dom/server"
import { IslandContext } from "./Island"
import type { ContextWrapper } from "./types"

// Helper to convert Node stream to string
async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
}

export interface IslandInfo {
    name: string;
    filePath: string;
    importPath: string;
}

/**
 * Render the page body content with island components loaded
 *
 * @param modulePath - Path to the page component module
 * @param _url - Deprecated: Route URL (now handled by page's context wrapper)
 * @param islands - Island components to load for SSR
 */
export const render = async (
    modulePath: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _url: string = "/",
    islands: IslandInfo[] = []
): Promise<string> => {
    // Step 1: Load all island components
    const islandComponents: Record<string, ComponentType<unknown>> = {};

    for (const island of islands) {
        try {
            console.log(`[SSR] Loading island component: ${island.name}`)
            const islandModule = await import(island.filePath /* @vite-ignore */);
            islandComponents[island.importPath] = islandModule.default;
        } catch (error) {
            console.error(`[SSR] Failed to load island ${island.name}:`, error);
        }
    }

    // Step 2: Load the page module
    const module = await import(modulePath /* @vite-ignore */);
    const Component = module.default;
    const ssgOptions = module.ssgOptions;
    const contextWrapper: ContextWrapper | undefined = ssgOptions?.context;

    // Step 3: Create the base page element with islands context
    const pageElement = React.createElement(
        IslandContext.Provider,
        { value: islandComponents },
        React.createElement(
            Suspense,
            { fallback: React.createElement("div", null, "Loading...") },
            React.createElement(Component)
        )
    );

    // Step 4: Wrap with page-defined context (if provided)
    let appElement: ReactNode;
    if (contextWrapper) {
        // Page defines its own context (Router, QueryClient, etc.)
        appElement = await Promise.resolve(contextWrapper(pageElement));
    } else {
        // No context wrapper - render page as-is (useful for simple static pages)
        console.warn(`[SSR] No context wrapper defined for ${modulePath}, rendering without providers`);
        appElement = pageElement;
    }

    // Step 5: Render to HTML
    const { prelude } = await prerenderToNodeStream(appElement as React.ReactElement);
    const html = await streamToString(prelude);
    return html;
}

/**
 * Render the page's Head component from ssgOptions.Head
 */
export const renderHead = async (modulePath: string): Promise<string> => {
    const module = await import(modulePath /* @vite-ignore */);

    // Look for Head in ssgOptions first, then fallback to direct export
    const Head = module.ssgOptions?.Head || module.Head;

    if (!Head) {
        console.warn(`[renderHead] No Head found in ssgOptions or as export in ${modulePath}`)
        return "";
    }

    // Head is simple - no suspense or router needed
    const headHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Head)
    );

    return headHtml;
}
