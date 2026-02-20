/**
 * HTML Template Generator
 *
 * Generates the final static HTML document with all optimizations.
 */

import type { ResolvedSsgConfig } from "./types";

export interface HtmlTemplateOptions {
    /** Content for the <head> section (meta tags, title, etc.) */
    headContent: string;
    /** Content for the <body> section (rendered React app) */
    bodyContent: string;
    /** Path to the CSS file, or null if no CSS */
    cssPath: string | null;
    /** Path to the hydration JS file, or null if no hydration needed */
    hydrateJsPath: string | null;
    /** Route URL for SSR consistency */
    routeUrl: string;
    /** Preload tags for LCP images */
    imagePreloadTags?: string;
    /** Resolved SSG configuration */
    config: ResolvedSsgConfig;
}

/**
 * Generate a complete static HTML document
 */
export function generateHtmlTemplate(options: HtmlTemplateOptions): string {
    const {
        headContent,
        bodyContent,
        cssPath,
        hydrateJsPath,
        routeUrl,
        imagePreloadTags = "",
        config,
    } = options;

    return `<!DOCTYPE html>
<html lang="${config.html.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Preload critical images (LCP) -->
    ${imagePreloadTags}

    <!-- CSS (render-blocking to prevent layout shift) -->
    ${cssPath ? `<link rel="stylesheet" href="${cssPath}">` : ""}

    <!-- Page-defined head content -->
    ${headContent}

    <!-- Additional head tags from config -->
    ${config.html.headTags}
</head>
<body>
    <div id="root">${bodyContent}</div>
    ${hydrateJsPath ? generateHydrationScript(hydrateJsPath, routeUrl) : ""}
    ${config.html.bodyTags}
</body>
</html>`;
}

/**
 * Generate the inline hydration loader script
 */
function generateHydrationScript(hydrateJsPath: string, routeUrl: string): string {
    return `<!-- SSR route for hydration consistency -->
    <script>window.__SSR_ROUTE__ = ${JSON.stringify(routeUrl)};</script>
    <!-- Lazy-load hydration script when user interacts or island is visible -->
    <script>
    (function() {
      var loaded = false;
      function loadHydration() {
        if (loaded) return;
        loaded = true;
        var s = document.createElement('script');
        s.type = 'module';
        s.src = ${JSON.stringify(hydrateJsPath)};
        document.body.appendChild(s);
      }
      // Load on any user interaction
      ['click', 'touchstart', 'mouseover', 'scroll'].forEach(function(e) {
        document.addEventListener(e, loadHydration, { once: true, passive: true });
      });
      // Also load when islands become visible (IntersectionObserver)
      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) { loadHydration(); observer.disconnect(); }
          });
        }, { rootMargin: '200px' });
        document.querySelectorAll('[data-island]').forEach(function(el) { observer.observe(el); });
      } else {
        // Fallback: load after idle
        if ('requestIdleCallback' in window) { requestIdleCallback(loadHydration); }
        else { setTimeout(loadHydration, 2000); }
      }
    })();
    </script>`;
}
