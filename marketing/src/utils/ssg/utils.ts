/**
 * vite-plugin-ssg/utils
 *
 * Browser-safe utility types for SSG pages.
 * This entry point can be safely imported in browser code.
 */

import type { ComponentType, ReactNode } from 'react';

/**
 * Context wrapper function type
 * Wraps the page component with providers (Router, QueryClient, etc.)
 * Can be async to allow dynamic imports of server-only components
 */
export type ContextWrapper = (children: ReactNode) => Promise<ReactNode> | ReactNode;

/**
 * Static Site Generation Options for a page
 *
 * Export this from any page component to enable static generation.
 *
 * @example
 * ```tsx
 * import type { SsgOptions } from 'vite-plugin-ssg/utils';
 *
 * export const ssgOptions: SsgOptions = {
 *   slug: 'home',
 *   routeUrl: '/',
 *   Head: () => (
 *     <>
 *       <title>My Page</title>
 *       <meta name="description" content="..." />
 *     </>
 *   ),
 *   context: async (children) => {
 *     const { StaticRouter } = await import('react-router-dom/server');
 *     const { QueryClientProvider, QueryClient } = await import('@tanstack/react-query');
 *     const queryClient = new QueryClient();
 *     return (
 *       <QueryClientProvider client={queryClient}>
 *         <StaticRouter location="/">
 *           {children}
 *         </StaticRouter>
 *       </QueryClientProvider>
 *     );
 *   },
 * };
 * ```
 */
export interface SsgOptions {
    /**
     * Output slug - determines the output filename
     * e.g., "home" -> "dist/static/home.html"
     */
    slug: string;

    /**
     * Route URL for react-router
     * Used for hydration consistency with MemoryRouter
     * @default "/"
     */
    routeUrl?: string;

    /**
     * Head component that renders meta tags, title, etc.
     * Will be rendered into the <head> section of the HTML
     */
    Head?: ComponentType;

    /**
     * Context wrapper function
     * Wraps the page component with providers needed for SSR
     * Can be async to dynamically import server-only components like StaticRouter
     *
     * @param children - The page component to wrap
     * @returns The wrapped component tree with all providers
     */
    context?: ContextWrapper;
}
