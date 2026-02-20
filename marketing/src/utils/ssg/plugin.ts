/**
 * vite-plugin-ssg/plugin
 *
 * Node-only Vite plugin for static site generation.
 * This entry point should only be imported in vite.config.ts or Node.js scripts.
 */

// Vite plugin (recommended way to use)
export { ssgPlugin } from "./plugin/index.js";
export type { SsgPluginOptions, HostingConfig } from "./plugin/index.js";

// Manual generator function (for scripts/testing)
export { generateStatic } from "./gen-static";

// Configuration utilities
export { resolveConfig, DEFAULT_CONFIG } from "./config";

// Types - Build configuration (for build scripts)
export type {
    SsgBuildConfig,
    ResolvedSsgConfig,
    ImageOptimizationConfig,
    CssConfig,
    JsConfig,
    HtmlConfig,
    VitePluginsConfig,
    // Re-exported from Vite for convenience
    PluginOption,
    BuildOptions,
    LogLevel,
} from "./types";

// Re-export page options types for convenience
export type { SsgOptions, ContextWrapper } from "./utils";
