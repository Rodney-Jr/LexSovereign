import * as ReactDOMServer from 'react-dom/server';
import App from './App';
import { HelmetProvider, MemoryRouter } from './utils/ssr-compat';

// For SSG/SSR with Lazy components, we need to wait for all components to be ready.
// renderToString is synchronous and doesn't wait for Suspense.
// In React 19, we should ideally use renderToPipeableStream, but for simple SSG,
// we can also use a 'pre-rendering' check or just ensure no lazy components are used during the SSR pass.

export async function render(url: string) {
    const helmetContext = {};

    // Note: To truly fix the 'Suspense abort' with renderToString, 
    // we would need to pre-load all components.
    // For now, we'll use renderToStaticMarkup which is often used for SSG.
    const appHtml = ReactDOMServer.renderToString(
        <HelmetProvider context={helmetContext}>
            <MemoryRouter initialEntries={[url]}>
                <App />
            </MemoryRouter>
        </HelmetProvider>
    );

    return { appHtml, helmet: (helmetContext as any).helmet };
}
