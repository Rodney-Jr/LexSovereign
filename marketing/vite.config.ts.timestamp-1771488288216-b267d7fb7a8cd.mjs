// vite.config.ts
import { defineConfig } from "file:///C:/Users/LENOVO/Desktop/LexSovereign/marketing/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/LENOVO/Desktop/LexSovereign/marketing/node_modules/@vitejs/plugin-react/dist/index.js";
import { ssgPlugin } from "file:///C:/Users/LENOVO/Desktop/LexSovereign/marketing/node_modules/vite-plugin-ssg/dist/plugin.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // Only run SSG during standard production build, not SSR build
    !process.env.VITE_SSR_BUILD && ssgPlugin({
      pages: [
        "src/pages/HomePage.tsx",
        "src/pages/ForLawFirms.tsx",
        "src/pages/ForEnterprise.tsx",
        "src/pages/ForGovernment.tsx",
        "src/pages/PricingPage.tsx",
        "src/pages/SecurityPage.tsx",
        "src/pages/ClientIntakePage.tsx"
      ],
      config: {
        outDir: "dist/static",
        baseUrl: "/"
      }
    })
  ].filter(Boolean),
  ssr: {
    noExternal: [/react-router/]
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    allowedHosts: [
      "marketing.railway.internal",
      ".railway.app"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMRU5PVk9cXFxcRGVza3RvcFxcXFxMZXhTb3ZlcmVpZ25cXFxcbWFya2V0aW5nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMRU5PVk9cXFxcRGVza3RvcFxcXFxMZXhTb3ZlcmVpZ25cXFxcbWFya2V0aW5nXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9MRU5PVk8vRGVza3RvcC9MZXhTb3ZlcmVpZ24vbWFya2V0aW5nL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgeyBzc2dQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1zc2cnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHJlYWN0KCksXHJcbiAgICAgICAgLy8gT25seSBydW4gU1NHIGR1cmluZyBzdGFuZGFyZCBwcm9kdWN0aW9uIGJ1aWxkLCBub3QgU1NSIGJ1aWxkXHJcbiAgICAgICAgIXByb2Nlc3MuZW52LlZJVEVfU1NSX0JVSUxEICYmIHNzZ1BsdWdpbih7XHJcbiAgICAgICAgICAgIHBhZ2VzOiBbXHJcbiAgICAgICAgICAgICAgICAnc3JjL3BhZ2VzL0hvbWVQYWdlLnRzeCcsXHJcbiAgICAgICAgICAgICAgICAnc3JjL3BhZ2VzL0Zvckxhd0Zpcm1zLnRzeCcsXHJcbiAgICAgICAgICAgICAgICAnc3JjL3BhZ2VzL0ZvckVudGVycHJpc2UudHN4JyxcclxuICAgICAgICAgICAgICAgICdzcmMvcGFnZXMvRm9yR292ZXJubWVudC50c3gnLFxyXG4gICAgICAgICAgICAgICAgJ3NyYy9wYWdlcy9QcmljaW5nUGFnZS50c3gnLFxyXG4gICAgICAgICAgICAgICAgJ3NyYy9wYWdlcy9TZWN1cml0eVBhZ2UudHN4JyxcclxuICAgICAgICAgICAgICAgICdzcmMvcGFnZXMvQ2xpZW50SW50YWtlUGFnZS50c3gnXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIGNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgb3V0RGlyOiAnZGlzdC9zdGF0aWMnLFxyXG4gICAgICAgICAgICAgICAgYmFzZVVybDogJy8nLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gICAgc3NyOiB7XHJcbiAgICAgICAgbm9FeHRlcm5hbDogWy9yZWFjdC1yb3V0ZXIvXSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICBob3N0OiB0cnVlLFxyXG4gICAgICAgIHBvcnQ6IDUxNzMsXHJcbiAgICAgICAgcHJveHk6IHtcclxuICAgICAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxyXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIHByZXZpZXc6IHtcclxuICAgICAgICBhbGxvd2VkSG9zdHM6IFtcclxuICAgICAgICAgICAgJ21hcmtldGluZy5yYWlsd2F5LmludGVybmFsJyxcclxuICAgICAgICAgICAgJy5yYWlsd2F5LmFwcCdcclxuICAgICAgICBdXHJcbiAgICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1UsU0FBUyxvQkFBb0I7QUFDclcsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsaUJBQWlCO0FBSTFCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLE1BQU07QUFBQTtBQUFBLElBRU4sQ0FBQyxRQUFRLElBQUksa0JBQWtCLFVBQVU7QUFBQSxNQUNyQyxPQUFPO0FBQUEsUUFDSDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0o7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxNQUNiO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLEtBQUs7QUFBQSxJQUNELFlBQVksQ0FBQyxjQUFjO0FBQUEsRUFDL0I7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxNQUNaO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLGNBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
