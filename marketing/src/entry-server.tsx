import * as ReactDOMServer from 'react-dom/server';
import App from './App';
import { HelmetProvider, MemoryRouter } from './utils/ssr-compat';

// For SSG/SSR with Lazy components, we need to wait for all components to be ready.
// renderToString is synchronous and doesn't wait for Suspense.
// In React 19, we should ideally use renderToPipeableStream, but for simple SSG,
// we can also use a 'pre-rendering' check or just ensure no lazy components are used during the SSR pass.

// For SSG/SSR with Lazy components in React 19, renderToString can abort if hit by Suspense.
// We use a pattern that collects the stream output once all components are ready.
import { Writable } from 'node:stream';

export async function render(url: string) {
    const helmetContext = {};
    let appHtml = '';

    return new Promise((resolve, reject) => {
        let didError = false;

        const { pipe } = ReactDOMServer.renderToPipeableStream(
            <HelmetProvider context={helmetContext}>
                <MemoryRouter initialEntries={[url]}>
                    <App />
                </MemoryRouter>
            </HelmetProvider>,
            {
                onAllReady() {
                    const writable = new Writable({
                        write(chunk, encoding, callback) {
                            appHtml += chunk.toString();
                            callback();
                        },
                        final(callback) {
                            resolve({ appHtml, helmet: (helmetContext as any).helmet });
                            callback();
                        }
                    });
                    pipe(writable);
                    writable.end();
                },
                onShellError(err) {
                    reject(err);
                },
                onError(err) {
                    didError = true;
                    console.error('[SSR Error]', err);
                }
            }
        );
    });
}
