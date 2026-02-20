/**
 * Island Scanner
 *
 * Scans a component file and its dependencies to find all Island usages
 * and validates that referenced components have the 'use island' directive.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface IslandInfo {
  /** The island name (derived from filename) */
  name: string;
  /** Absolute path to the island component file */
  filePath: string;
  /** Import path relative to src/ */
  importPath: string;
}

/**
 * Check if a file contains the 'use island' directive
 */
function hasIslandDirective(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const firstLine = content.split('\n')[0].trim();
    // Match 'use island' or "use island" with optional semicolon
    return /^['"]use island['"];?$/.test(firstLine);
  } catch {
    return false;
  }
}

/**
 * Resolve a component path (relative to src/) to an absolute file path
 */
function resolveComponentPath(componentPath: string, srcDir: string): string | null {
  const basePath = path.join(srcDir, componentPath);

  // Try different extensions
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  for (const ext of extensions) {
    const fullPath = basePath + ext;
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
  }

  // Try index files
  for (const ext of extensions) {
    const indexPath = path.join(basePath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

/**
 * Get the component name from a path
 */
function getComponentName(componentPath: string): string {
  return componentPath.split('/').pop() || componentPath;
}

/**
 * Extract Island component usages from a file
 * Looks for patterns like: <Island component="path/to/Component">
 */
function extractIslandUsages(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const usages: string[] = [];

    // Match <Island component="..." or <Island component={'...'}
    const islandRegex = /<Island\s+[^>]*component=["'{]([^"'}]+)["'}]/g;
    let match;

    while ((match = islandRegex.exec(content)) !== null) {
      usages.push(match[1]);
    }

    return usages;
  } catch {
    return [];
  }
}

/**
 * Extract import paths from a TypeScript/JavaScript file
 */
function extractImports(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports: string[] = [];

    const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  } catch {
    return [];
  }
}

/**
 * Resolve an import path to an absolute file path
 */
function resolveImportPath(importPath: string, fromFile: string, srcDir: string): string | null {
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null;
  }

  const fromDir = path.dirname(fromFile);
  let resolved: string;

  if (importPath.startsWith('.')) {
    resolved = path.resolve(fromDir, importPath);
  } else {
    resolved = path.resolve(srcDir, importPath);
  }

  const extensions = ['', '.tsx', '.ts', '.jsx', '.js'];
  for (const ext of extensions) {
    const fullPath = resolved + ext;
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
  }

  for (const ext of ['.tsx', '.ts', '.jsx', '.js']) {
    const indexPath = path.join(resolved, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

/**
 * Scan a component file and its dependencies to find all Island usages
 */
export function scanForIslands(entryFile: string, srcDir: string): IslandInfo[] {
  const islands: IslandInfo[] = [];
  const foundComponentPaths = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [entryFile];

  // Traverse the component tree to find all Island usages
  while (queue.length > 0) {
    const currentFile = queue.shift()!;

    if (visited.has(currentFile)) continue;
    visited.add(currentFile);

    // Find Island usages in this file
    const islandUsages = extractIslandUsages(currentFile);
    for (const componentPath of islandUsages) {
      foundComponentPaths.add(componentPath);
    }

    // Continue traversing imports (only local ones)
    const imports = extractImports(currentFile);
    for (const imp of imports) {
      const resolvedPath = resolveImportPath(imp, currentFile, srcDir);
      if (resolvedPath && !visited.has(resolvedPath)) {
        queue.push(resolvedPath);
      }
    }
  }

  // Resolve and validate each island component
  for (const componentPath of foundComponentPaths) {
    const resolvedPath = resolveComponentPath(componentPath, srcDir);

    if (!resolvedPath) {
      console.warn(`[Island Scanner] Could not resolve component: ${componentPath}`);
      continue;
    }

    if (!hasIslandDirective(resolvedPath)) {
      console.warn(`[Island Scanner] Component missing 'use island' directive: ${componentPath}`);
      continue;
    }

    const name = getComponentName(componentPath);

    // Avoid duplicates
    if (!islands.find(i => i.importPath === componentPath)) {
      islands.push({
        name,
        filePath: resolvedPath,
        importPath: componentPath,
      });
    }
  }

  return islands;
}

/**
 * Generate the hydration script content based on detected islands
 */
export function generateHydrationScript(islands: IslandInfo[]): string {
  if (islands.length === 0) {
    return `// No islands detected - nothing to hydrate
export {};
`;
  }

  // Use absolute paths since the temp file is in node_modules/.vite-plugin-ssg/
  const imports = islands.map(island =>
    `import ${island.name} from '${island.filePath}';`
  ).join('\n');

  const registry = islands.map(island =>
    `  ${island.name},`
  ).join('\n');

  return `/**
 * Auto-generated Island Hydration Script
 *
 * This file is automatically generated by the static site generator.
 * Do not edit manually.
 */

import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Auto-detected island components
${imports}

// Island component registry
const islandComponents: Record<string, React.ComponentType<any>> = {
${registry}
};

// Create a single QueryClient for all islands
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

// Get the SSR route from the embedded script (for hydration consistency)
declare global {
  interface Window {
    __SSR_ROUTE__?: string;
  }
}

function hydrateIslands() {
  const islands = document.querySelectorAll('[data-island]');
  // Use MemoryRouter with SSR route for initial hydration to match server state
  const ssrRoute = window.__SSR_ROUTE__ || '/';

  islands.forEach((island) => {
    const name = island.getAttribute('data-island');
    const propsJson = island.getAttribute('data-island-props') || '{}';

    if (!name) return;

    const Component = islandComponents[name];
    if (!Component) {
      console.warn(\`Unknown island component: \${name}\`);
      return;
    }

    try {
      const props = JSON.parse(propsJson);

      // Use MemoryRouter with the SSR route to match server-rendered state
      // This ensures hydration doesn't fail due to URL differences
      const element = (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[ssrRoute]}>
            <Component {...props} />
          </MemoryRouter>
        </QueryClientProvider>
      );

      hydrateRoot(island, element);
      console.log(\`Hydrated island: \${name}\`);
    } catch (error) {
      console.error(\`Failed to hydrate island \${name}:\`, error);
    }
  });
}

// Run hydration when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrateIslands);
} else {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(hydrateIslands);
  } else {
    setTimeout(hydrateIslands, 1);
  }
}
`;
}
