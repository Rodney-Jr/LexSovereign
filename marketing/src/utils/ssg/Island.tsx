import React, { createContext, useContext, ComponentType } from 'react';

/**
 * Context for pre-loaded island components during SSR.
 * The SSG system populates this with { componentPath: Component } entries.
 */
export const IslandContext = createContext<Record<string, ComponentType<any>>>({});

interface IslandProps {
  /**
   * Path to the island component module (relative to src/).
   * The component must have 'use island' directive at the top.
   * Example: "components/common/BeforeAfterCarousel"
   */
  component: string;
  /** Props to pass to the component (must be JSON-serializable for hydration) */
  props?: Record<string, unknown>;
  /**
   * Fallback content to render while loading or if component is not available.
   */
  children?: React.ReactNode;
}

/**
 * Island wrapper component for partial hydration.
 *
 * Usage:
 * ```tsx
 * <Island component="components/common/BeforeAfterCarousel" props={{ initialIndex: 0 }} />
 * ```
 *
 * During SSG:
 * - The island scanner detects this usage
 * - The component is loaded and provided via IslandContext
 * - This wrapper renders the actual component (not raw HTML)
 *
 * During client hydration:
 * - The hydration script loads the same components
 * - React hydrates the pre-rendered HTML with the interactive component
 */
export const Island: React.FC<IslandProps> = ({ component, props = {}, children }) => {
  const islandComponents = useContext(IslandContext);
  const name = component.split('/').pop() || component;
  const Component = islandComponents[component];

  return (
    <div
      data-island={name}
      data-island-component={component}
      data-island-props={JSON.stringify(props)}
      style={{ display: 'contents' }}
    >
      {Component ? (
        <Component {...props} />
      ) : (
        // Fallback when component is not loaded (shouldn't happen in SSG)
        children || <div>Loading {name}...</div>
      )}
    </div>
  );
};

export default Island;
