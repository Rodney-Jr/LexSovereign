import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3002,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    preview: {
        allowedHosts: [
            'extraordinary-perfection-production-5752.up.railway.app',
            'www.nomosdesk.com',
            'nomosdesk.com'
        ]
    }
})
