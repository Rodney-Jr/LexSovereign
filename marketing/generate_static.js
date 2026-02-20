import { createServer } from 'vite';
import path from 'path';
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, HelmetProvider } from './src/utils/ssr-compat.js';

const ROUTES = [
    { path: '/src/pages/HomePage.tsx', slug: 'index', url: '/' },
    { path: '/src/pages/ForLawFirms.tsx', slug: 'for-law-firms', url: '/for-law-firms' },
    { path: '/src/pages/ForEnterprise.tsx', slug: 'for-enterprise', url: '/for-enterprise' },
    { path: '/src/pages/ForGovernment.tsx', slug: 'for-government', url: '/for-government' },
    { path: '/src/pages/PricingPage.tsx', slug: 'pricing', url: '/pricing' },
    { path: '/src/pages/SecurityPage.tsx', slug: 'security', url: '/security' },
    { path: '/src/pages/ClientIntakePage.tsx', slug: 'client-intake', url: '/client-intake' },
];

async function generateStatic() {
    const root = process.cwd();
    const outDir = path.resolve(root, 'dist/static');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const vite = await createServer({
        configFile: false,
        root: root,
        server: { middlewareMode: true },
        appType: 'custom',
        ssr: {
            external: [
                'react-router-dom',
                'react-router',
                'react-helmet-async',
                'react',
                'react-dom',
                'lucide-react',
                'framer-motion',
                'clsx',
                'tailwind-merge'
            ],
        }
    });

    try {
        for (const route of ROUTES) {
            console.log(`[SSG] Generating ${route.url}...`);
            const modulePath = path.resolve(root, route.path.startsWith('/') ? route.path.substring(1) : route.path);

            try {
                const { default: Component } = await vite.ssrLoadModule(modulePath);

                const html = renderToString(
                    React.createElement(HelmetProvider, {},
                        React.createElement(StaticRouter, { location: route.url },
                            React.createElement(Component)
                        )
                    )
                );

                // Simple HTML wrapper (aligned with marketing site's index.html)
                const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/index.css">
    <title>NomosDesk</title>
</head>
<body class="bg-slate-900 text-white">
    <div id="root">${html}</div>
</body>
</html>`;

                fs.writeFileSync(path.join(outDir, `${route.slug}.html`), finalHtml);
                console.log(`[SSG] Successfully generated ${route.slug}.html`);
            } catch (err) {
                console.error(`[SSG] Failed for ${route.url}:`, err.message);
            }
        }
        console.log('[SSG] All pages generated!');
    } finally {
        await vite.close();
    }
}

generateStatic().catch(console.error);
