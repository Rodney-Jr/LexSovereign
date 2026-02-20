/**
 * vite-plugin-ssg
 *
 * A Vite plugin for static site generation with React and island architecture.
 *
 * This package has three entry points:
 *
 * - `vite-plugin-ssg` or `vite-plugin-ssg/plugin` - Node-only Vite plugin (for vite.config.ts)
 * - `vite-plugin-ssg/browser` - Browser-safe Island component (for React components)
 * - `vite-plugin-ssg/utils` - Browser-safe types only (for page components)
 *
 * @example
 * ```typescript
 * // vite.config.ts (Node-only)
 * import { ssgPlugin } from 'vite-plugin-ssg';
 *
 * export default defineConfig({
 *   plugins: [react(), ssgPlugin({ pages: 'src/pages/' })],
 * });
 * ```
 *
 * @example
 * ```tsx
 * // React component (browser)
 * import { Island } from 'vite-plugin-ssg/browser';
 * import type { SsgOptions } from 'vite-plugin-ssg/utils';
 *
 * export const ssgOptions: SsgOptions = {
 *   slug: 'home',
 *   routeUrl: '/',
 * };
 *
 * export default function HomePage() {
 *   return <Island component="components/Header" />;
 * }
 * ```
 */

// Re-export everything from plugin for backwards compatibility
// Note: This entry point is Node-only
export * from "./plugin";
