import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ssgPlugin } from 'vite-plugin-ssg'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, isSsrBuild }) => {
    return {
        plugins: [
            react(),
            // Manual SSG via scripts/prerender.js due to Windows resolution issues
            /*
            ssgPlugin({
                ...
            })
            */
        ],
        resolve: {
            alias: [
                { find: '@', replacement: path.resolve(__dirname, './src') },
                { find: /^react-router-dom$/, replacement: path.resolve(__dirname, 'node_modules/react-router-dom/dist/index.mjs') },
                { find: /^react-router$/, replacement: path.resolve(__dirname, 'node_modules/react-router/dist/development/index.mjs') },
                { find: /^react-router\/dom$/, replacement: path.resolve(__dirname, 'node_modules/react-router/dist/development/dom-export.mjs') },
                { find: /^react-helmet-async$/, replacement: path.resolve(__dirname, 'node_modules/react-helmet-async/lib/index.esm.js') },
            ],
            dedupe: ['react', 'react-dom']
        },
        ssr: {
            target: 'node',
            external: ['react', 'react-dom', 'react-dom/server'],
            // Bundle everything except react and react-dom
            noExternal: [/^(?!react|react-dom).*$/],
            resolve: {
                conditions: ['node', 'require', 'default'],
                externalConditions: ['node', 'require', 'default']
            }
        },
        build: {
            target: 'esnext',
            minify: false,
            rollupOptions: {
                output: {
                    format: isSsrBuild ? 'cjs' : 'es',
                    entryFileNames: isSsrBuild ? '[name].cjs' : '[name].js',
                }
            }
        },
        server: {
            host: true,
            port: 5173,
            proxy: {
                '/api': {
                    target: 'http://localhost:3002',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        preview: {
            port: Number(process.env.PORT) || 8080,
            host: true,
            allowedHosts: true // Fix for 403 Forbidden on custom domains in Vite 6+
        }
    }
})
