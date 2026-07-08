import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  build: {
    // Avoid terser race causing Workbox SW write failures
    minify: "esbuild",
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["pwa-icon.svg", "pwa-maskable.svg"],
      // devOptions: {
      //   enabled: true,
      //   type: "module",
      // },
      manifest: {
        name: "Float Walk",
        short_name: "Float Walk",
        description: "Float Walk - Footwear Retail Management System",
        theme_color: "#0ea5e9",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/pwa-maskable.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Workbox-build currently fails while minifying SW via terser in this project.
        // Using development mode avoids the terser bundling step and keeps PWA functional.
        mode: "development",
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff2}"],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style" ||
              request.destination === "worker",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "assets" },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: { cacheName: "images" },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
