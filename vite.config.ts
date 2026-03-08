import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Converts render-blocking CSS <link> tags to non-blocking with print/onload pattern.
 * Injects a tiny inline critical CSS block so there's no FOUC for the initial paint.
 */
function deferCssPlugin(): Plugin {
  return {
    name: 'defer-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Critical inline CSS: design-system variables + body base styles for first paint
      const criticalCss = `<style id="critical-css">
:root{--background:0 0% 100%;--foreground:220 9% 13%;--primary:217 89% 61%;--primary-foreground:0 0% 100%;--muted:220 14% 96%;--muted-foreground:220 9% 46%;--border:220 13% 91%;--card:0 0% 100%;--card-foreground:220 9% 13%;--radius:0.5rem}
*{border-color:hsl(var(--border))}
body{background:hsl(var(--background));color:hsl(var(--foreground));-webkit-font-smoothing:antialiased;font-family:'DM Sans','Tajawal',-apple-system,BlinkMacSystemFont,sans-serif;font-weight:500;letter-spacing:-0.01em;margin:0}
</style>`;

      // Insert critical CSS before </head>
      html = html.replace('</head>', criticalCss + '\n</head>');

      // Convert CSS <link rel="stylesheet"> to async loading pattern
      html = html.replace(
        /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
        '<link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'">\n    <noscript><link rel="stylesheet" href="$1"></noscript>'
      );

      return html;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
  },
  plugins: [
    deferCssPlugin(),
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.ico', 'og-image.png', 'icons/*.png'],
      manifest: {
        name: 'CityHealth',
        short_name: 'CityHealth',
        description: 'Trouvez des prestataires de santé en Algérie',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB limit
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
