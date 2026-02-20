
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const toAbsolute = (p) => path.resolve(__dirname, '../', p);

const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8');
const { render } = require('../dist/ssr/entry-server.cjs');

const routesToPrerender = [
    '/',
    '/for-law-firms',
    '/for-enterprise-legal',
    '/for-government',
    '/pricing',
    '/security-and-compliance',
    '/client-intake-assistant',
    '/privacy',
    '/terms',
    '/insights',
    '/insights/legal-software-africa-guide',
    '/insights/government-legal-case-management',
    '/insights/conflict-checking-software-law-firms',
    '/insights/sovereign-legal-data-infrastructure',
    '/insights/nomosdesk-vs-clio',
];

(async () => {
    console.log('Starting pre-rendering...');
    for (const url of routesToPrerender) {
        try {
            const { appHtml, helmet } = await render(url);

            // Replace root div with app HTML
            let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

            // Strip default title and meta description to avoid duplicates with Helmet
            html = html.replace(/<title>.*?<\/title>/s, '');
            html = html.replace(/<meta name="description".*?>/s, '');

            if (helmet) {
                const headTags = `
                    ${helmet.title.toString()}
                    ${helmet.meta.toString()}
                    ${helmet.link.toString()}
                    ${helmet.script.toString()}
                `;
                html = html.replace('</head>', `${headTags}</head>`);
            }

            const filePath = `dist${url === '/' ? '/index.html' : `${url}/index.html`}`;
            const fullPath = toAbsolute(filePath);

            const dirname = path.dirname(fullPath);
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname, { recursive: true });
            }

            fs.writeFileSync(fullPath, html);
            console.log('Pre-rendered:', filePath);
        } catch (e) {
            console.error(`Error pre-rendering ${url}:`, e);
        }
    }
    console.log('Pre-rendering complete.');
})();
