/**
 * Static Site Generation Types
 *
 * Types for configuring the SSG system and individual pages.
 * Uses Vite's exported types where applicable for consistency.
 */

import type { ComponentType, ReactNode } from 'react';
import type {
    PluginOption,
    BuildOptions,
    LogLevel,
} from 'vite';

// Re-export useful Vite types for consumers
export type { PluginOption, BuildOptions, LogLevel };

// ============================================================================
// Page Options (exported by each page component)
// ============================================================================

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
 * import { SsgOptions } from '../static-gen/types';
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

// ============================================================================
// Build Configuration (passed to the SSG system)
// ============================================================================

/**
 * Image optimization configuration
 */
export interface ImageOptimizationConfig {
    /** Enable/disable image optimization @default true */
    enabled?: boolean;
    /** Output formats to generate @default ['webp'] */
    formats?: ('webp' | 'avif' | 'original')[];
    /** Quality for lossy compression (1-100) @default 80 */
    quality?: number;
    /** Generate srcset for responsive images @default true */
    generateSrcset?: boolean;
    /** Multipliers for srcset @default [1, 2] */
    srcsetMultipliers?: number[];
    /** Number of LCP images to preload @default 4 */
    lcpImageCount?: number;
}

/**
 * CSS build configuration
 * Uses Vite's cssMinify type for the minify option
 */
export interface CssConfig {
    /** CSS minifier to use @default 'lightningcss' */
    minify?: BuildOptions['cssMinify'];
    /** Path to global CSS file to include @default 'src/index.css' */
    globalCssPath?: string;
}

/**
 * JavaScript/hydration build configuration
 * Uses Vite's BuildOptions types for minify and target
 */
export interface JsConfig {
    /** JS minifier to use @default 'terser' */
    minify?: BuildOptions['minify'];
    /** ES target for output @default 'es2020' */
    target?: BuildOptions['target'];
    /** Terser-specific options (only used when minify: 'terser') */
    terserOptions?: {
        /** Remove console.* calls @default true */
        dropConsole?: boolean;
        /** Remove debugger statements @default true */
        dropDebugger?: boolean;
        /** Number of compression passes @default 2 */
        passes?: number;
    };
}

/**
 * HTML template configuration
 */
export interface HtmlConfig {
    /** Additional tags to inject into <head> */
    headTags?: string;
    /** Additional tags to inject at end of <body> */
    bodyTags?: string;
    /** HTML lang attribute @default 'en' */
    lang?: string;
}

/**
 * Vite plugin configuration
 */
export interface VitePluginsConfig {
    /** Additional Vite plugins to include */
    plugins?: PluginOption[];
}

/**
 * Main SSG build configuration
 *
 * @example
 * ```typescript
 * const config: SsgBuildConfig = {
 *   outDir: 'dist/static',
 *   baseUrl: '/static',
 *   vite: {
 *     plugins: [myCustomPlugin()],
 *   },
 *   images: {
 *     quality: 85,
 *     formats: ['webp', 'avif'],
 *   },
 *   css: {
 *     minify: 'lightningcss',
 *   },
 *   js: {
 *     minify: 'terser',
 *     target: 'es2020',
 *   },
 * };
 * ```
 */
export interface SsgBuildConfig {
    /** Output directory for static files @default 'dist/static' */
    outDir?: string;

    /** Base URL path for assets @default '/static' */
    baseUrl?: string;

    /** Source directory @default 'src' */
    srcDir?: string;

    /** Vite plugins configuration */
    vite?: VitePluginsConfig;

    /** Image optimization settings */
    images?: ImageOptimizationConfig;

    /** CSS build settings */
    css?: CssConfig;

    /** JavaScript build settings */
    js?: JsConfig;

    /** HTML template settings */
    html?: HtmlConfig;

    /** Log level (uses Vite's LogLevel type) @default 'info' */
    logLevel?: LogLevel | 'debug';
}

/**
 * Resolved configuration with all defaults applied
 * All optional fields become required with default values
 */
export interface ResolvedSsgConfig {
    outDir: string;
    baseUrl: string;
    srcDir: string;
    vite: Required<VitePluginsConfig>;
    images: Required<ImageOptimizationConfig>;
    css: Required<CssConfig>;
    js: Required<JsConfig>;
    html: Required<HtmlConfig>;
    logLevel: LogLevel | 'debug';
}
