/**
 * Hosting Configuration Types
 *
 * Base types for hosting platform integrations.
 */

/**
 * Information about a generated static page
 */
export interface GeneratedPage {
    /** Output slug (e.g., "home") */
    slug: string;
    /** Route URL (e.g., "/") */
    routeUrl: string;
    /** Path to the generated HTML file relative to output dir */
    htmlPath: string;
}

/**
 * Base interface for hosting configurators
 */
export interface HostingConfigurator {
    /** Name of the hosting platform */
    name: string;

    /**
     * Configure the hosting platform for serving static pages
     *
     * @param pages - List of generated static pages
     * @param baseUrl - Base URL path for static assets
     */
    configure(pages: GeneratedPage[], baseUrl: string): Promise<void>;
}
