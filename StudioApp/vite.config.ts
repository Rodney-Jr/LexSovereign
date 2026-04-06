import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3006,
    cors: true
  },
  css: {
    postcss: {}
  },
  optimizeDeps: {
    // pdfjs-dist v5+ uses import.meta.url for its worker which Vite's
    // pre-bundler (esbuild) cannot handle correctly — serve it as raw ESM
    exclude: ['pdfjs-dist']
  }
})

