import * as ReactDOMServer from 'react-dom/server';
import App from './App';
import { HelmetProvider, MemoryRouter } from './utils/ssr-compat';

const renderToString = (ReactDOMServer as any).renderToString || ReactDOMServer;

export async function render(url: string) {
    const helmetContext = {};
    const appHtml = renderToString(
        <HelmetProvider context={helmetContext}>
            <MemoryRouter initialEntries={[url]}>
                <App />
            </MemoryRouter>
        </HelmetProvider>
    );

    return { appHtml, helmet: (helmetContext as any).helmet };
}
