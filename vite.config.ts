import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    cacheDir: '/tmp/vite_apprenix_v3',
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          navigationPreload: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,woff,ttf,otf}'],
          additionalManifestEntries: [
            { url: '/offline.html', revision: '6' },
            { url: '/manifest.json', revision: '11' },
          ],
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [
            /^\/rest\//,
            /^\/auth\//,
            /^\/storage\//,
            /^\/functions\//,
            /supabase\.co/,
            /\.supabase\./,
            /\/api\//,
            /\/__/,
          ],
          offlineGoogleAnalytics: false,
          runtimeCaching: [
            // Supabase — NetworkFirst, timeout serré
            {
              urlPattern: /https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-data-cache',
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
                matchOptions: { ignoreVary: true },
              },
            },
            // Google Fonts — CacheFirst, 1 an
            {
              urlPattern: /https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // Images locales et distantes — StaleWhileRevalidate
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)(\?.*)?$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images-cache',
                expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // Audio / fichiers sonores (ambiances Deep Work)
            {
              urlPattern: /\.(?:mp3|ogg|wav|opus|m4a|aac)(\?.*)?$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio-cache',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [0, 200] },
                rangeRequests: true,
              },
            },
            // YouTube nocookie (ChansonsEduPage) — NetworkFirst, fallback cache
            {
              urlPattern: /https:\/\/www\.youtube(?:-nocookie)?\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'youtube-embed-cache',
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 3 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // Données éducation nationale
            {
              urlPattern: /https:\/\/data\.education\.gouv\.fr\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'education-api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // JSON / XML statiques (hors Supabase)
            {
              urlPattern: /https:\/\/(?!.*supabase).*\.(json|xml)(\?.*)?$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-api-cache',
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // CDN externes (jsDelivr, unpkg)
            {
              urlPattern: /https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'external-cdn-cache',
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        manifest: false,
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL':
        JSON.stringify(env.VITE_SUPABASE_URL ?? ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY':
        JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? ''),
      'import.meta.env.VITE_APP_ID':
        JSON.stringify(env.VITE_APP_ID ?? ''),
    },
    build: {
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
      chunkSizeWarningLimit: 600,
      sourcemap: false,
      cssCodeSplit: true,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/"))
              return "vendor-react";
            if (id.includes("node_modules/react-router"))
              return "vendor-router";
            if (id.includes("node_modules/lucide-react"))
              return "vendor-icons";
            if (id.includes("node_modules/@radix-ui"))
              return "vendor-radix";
            if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-"))
              return "vendor-charts";
            if (id.includes("node_modules/@supabase"))
              return "vendor-supabase";
            if (id.includes("node_modules/"))
              return "vendor-misc";
          },
        },
      },
    },
    optimizeDeps: {
      force: true,
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "lucide-react",
        "@radix-ui/react-dialog",
        "@radix-ui/react-select",
        "@radix-ui/react-tabs",
      ],
    },
  };
});
