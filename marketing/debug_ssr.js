import { createServer } from 'vite';
import path from 'path';
import fs from 'fs';
import React from 'react';

// Use the SSG plugin's entry point to be sure
async function debugSSR() {
    const root = process.cwd();
    const serverEntryPath = path.resolve(root, 'node_modules/vite-plugin-ssg/src/server-entry.tsx');
    console.log('Using server entry:', serverEntryPath);

    // We use the project's vite config now!
    const vite = await createServer({
        root: root,
        server: { middlewareMode: true },
        appType: 'custom',
    });

    try {
        const modulePath = path.resolve('src/pages/HomePage.tsx');
        console.log('Loading page module:', modulePath);

        const { render } = await vite.ssrLoadModule(serverEntryPath);
        console.log('Server entry loaded successfully!');

        console.log('Rendering HomePage via plugin entry...');
        try {
            const html = await render(modulePath, "/", []);
            console.log('Render successful! Length:', html.length);
            fs.writeFileSync('ssr_render_output_v10.html', html);
        } catch (renderError) {
            console.error('Render Error:', renderError.stack || renderError.message);
        }

    } catch (error) {
        const errorMsg = error.stack || error.message || String(error);
        fs.writeFileSync('ssr_error_log.txt', errorMsg);
        console.error('SSR Load Error saved to ssr_error_log.txt');
        console.error(errorMsg);
    } finally {
        await vite.close();
    }
}

debugSSR();
