/**
 * vite-plugin-ssg/browser
 *
 * Browser-safe exports for use in React components.
 * This entry point contains only code that can run in the browser.
 */

// Island component for partial hydration
export { Island, IslandContext } from "./Island";

// Re-export types from utils (browser-safe)
export type { SsgOptions, ContextWrapper } from "./utils";
