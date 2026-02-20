// vite.config.ts
import { defineConfig } from "file:///C:/Users/LENOVO/Desktop/LexSovereign/marketing/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/LENOVO/Desktop/LexSovereign/marketing/node_modules/@vitejs/plugin-react/dist/index.js";
import { ssgPlugin } from "file:///C:/Users/LENOVO/Desktop/LexSovereign/marketing/node_modules/vite-plugin-ssg/dist/plugin.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\LENOVO\\Desktop\\LexSovereign\\marketing";
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
      },
      verbose: true
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  ssr: {
    noExternal: ["react-router-dom", "react-router", "react-helmet-async"],
    alias: {
      "react-router-dom": path.resolve(__vite_injected_original_dirname, "node_modules/react-router-dom/dist/index.mjs"),
      "react-router": path.resolve(__vite_injected_original_dirname, "node_modules/react-router/dist/development/index.mjs"),
      "react-router/dom": path.resolve(__vite_injected_original_dirname, "node_modules/react-router/dist/development/dom-export.mjs"),
      "react-helmet-async": path.resolve(__vite_injected_original_dirname, "node_modules/react-helmet-async/lib/index.esm.js")
    }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMRU5PVk9cXFxcRGVza3RvcFxcXFxMZXhTb3ZlcmVpZ25cXFxcbWFya2V0aW5nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxMRU5PVk9cXFxcRGVza3RvcFxcXFxMZXhTb3ZlcmVpZ25cXFxcbWFya2V0aW5nXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9MRU5PVk8vRGVza3RvcC9MZXhTb3ZlcmVpZ24vbWFya2V0aW5nL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgeyBzc2dQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1zc2cnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHJlYWN0KCksXHJcbiAgICAgICAgLy8gT25seSBydW4gU1NHIGR1cmluZyBzdGFuZGFyZCBwcm9kdWN0aW9uIGJ1aWxkLCBub3QgU1NSIGJ1aWxkXHJcbiAgICAgICAgIXByb2Nlc3MuZW52LlZJVEVfU1NSX0JVSUxEICYmIHNzZ1BsdWdpbih7XHJcbiAgICAgICAgICAgIHBhZ2VzOiBbXHJcbiAgICAgICAgICAgICAgICAnc3JjL3BhZ2VzL0hvbWVQYWdlLnRzeCcsXHJcbiAgICAgICAgICAgICAgICAnc3JjL3BhZ2VzL0Zvckxhd0Zpcm1zLnRzeCcsXHJcbiAgICAgICAgICAgICAgICAnc3JjL3BhZ2VzL0ZvckVudGVycHJpc2UudHN4JyxcclxuICAgICAgICAgICAgICAgICdzcmMvcGFnZXMvRm9yR292ZXJubWVudC50c3gnLFxyXG4gICAgICAgICAgICAgICAgJ3NyYy9wYWdlcy9QcmljaW5nUGFnZS50c3gnLFxyXG4gICAgICAgICAgICAgICAgJ3NyYy9wYWdlcy9TZWN1cml0eVBhZ2UudHN4JyxcclxuICAgICAgICAgICAgICAgICdzcmMvcGFnZXMvQ2xpZW50SW50YWtlUGFnZS50c3gnXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIGNvbmZpZzoge1xyXG4gICAgICAgICAgICAgICAgb3V0RGlyOiAnZGlzdC9zdGF0aWMnLFxyXG4gICAgICAgICAgICAgICAgYmFzZVVybDogJy8nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB2ZXJib3NlOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBzc3I6IHtcclxuICAgICAgICBub0V4dGVybmFsOiBbJ3JlYWN0LXJvdXRlci1kb20nLCAncmVhY3Qtcm91dGVyJywgJ3JlYWN0LWhlbG1ldC1hc3luYyddLFxyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgICdyZWFjdC1yb3V0ZXItZG9tJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ25vZGVfbW9kdWxlcy9yZWFjdC1yb3V0ZXItZG9tL2Rpc3QvaW5kZXgubWpzJyksXHJcbiAgICAgICAgICAgICdyZWFjdC1yb3V0ZXInOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzL3JlYWN0LXJvdXRlci9kaXN0L2RldmVsb3BtZW50L2luZGV4Lm1qcycpLFxyXG4gICAgICAgICAgICAncmVhY3Qtcm91dGVyL2RvbSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdub2RlX21vZHVsZXMvcmVhY3Qtcm91dGVyL2Rpc3QvZGV2ZWxvcG1lbnQvZG9tLWV4cG9ydC5tanMnKSxcclxuICAgICAgICAgICAgJ3JlYWN0LWhlbG1ldC1hc3luYyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdub2RlX21vZHVsZXMvcmVhY3QtaGVsbWV0LWFzeW5jL2xpYi9pbmRleC5lc20uanMnKSxcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgaG9zdDogdHJ1ZSxcclxuICAgICAgICBwb3J0OiA1MTczLFxyXG4gICAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgICAgICcvYXBpJzoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcclxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBwcmV2aWV3OiB7XHJcbiAgICAgICAgYWxsb3dlZEhvc3RzOiBbXHJcbiAgICAgICAgICAgICdtYXJrZXRpbmcucmFpbHdheS5pbnRlcm5hbCcsXHJcbiAgICAgICAgICAgICcucmFpbHdheS5hcHAnXHJcbiAgICAgICAgXVxyXG4gICAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdVLFNBQVMsb0JBQW9CO0FBQ3JXLE9BQU8sV0FBVztBQUNsQixTQUFTLGlCQUFpQjtBQUMxQixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUztBQUFBLElBQ0wsTUFBTTtBQUFBO0FBQUEsSUFFTixDQUFDLFFBQVEsSUFBSSxrQkFBa0IsVUFBVTtBQUFBLE1BQ3JDLE9BQU87QUFBQSxRQUNIO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDSjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ0osUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLE1BQ2I7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNiLENBQUM7QUFBQSxFQUNMLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3hDO0FBQUEsRUFDSjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0QsWUFBWSxDQUFDLG9CQUFvQixnQkFBZ0Isb0JBQW9CO0FBQUEsSUFDckUsT0FBTztBQUFBLE1BQ0gsb0JBQW9CLEtBQUssUUFBUSxrQ0FBVyw4Q0FBOEM7QUFBQSxNQUMxRixnQkFBZ0IsS0FBSyxRQUFRLGtDQUFXLHNEQUFzRDtBQUFBLE1BQzlGLG9CQUFvQixLQUFLLFFBQVEsa0NBQVcsMkRBQTJEO0FBQUEsTUFDdkcsc0JBQXNCLEtBQUssUUFBUSxrQ0FBVyxrREFBa0Q7QUFBQSxJQUNwRztBQUFBLEVBQ0o7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxRQUNKLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxNQUNaO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLGNBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
