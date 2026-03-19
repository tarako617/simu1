import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/mobile-plan-simulator/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          includeAssets: ['icon.svg', 'apple-touch-icon.png', 'icon-192x192.png', 'icon-512x512.png'],
          manifest: {
            name: '料金シミュレーター',
            short_name: '料金シミュ',
            description: '携帯電話料金プランのシミュレーター',
            theme_color: '#cc0000',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/mobile-plan-simulator/',
            scope: '/mobile-plan-simulator/',
            icons: [
              {
                src: 'icon-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'icon-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
            navigateFallback: 'index.html',
            // Disable caching of external resources, only local.
            runtimeCaching: []
          },
          devOptions: {
            enabled: true
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
