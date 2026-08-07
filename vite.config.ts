import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'VenderBem Stock PWA',
        short_name: 'VenderBem',
        description: 'Gerenciamento de Estoque, Produtos e Vendas (PDV Mobile PWA)',
        theme_color: '#007AFF',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: []
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve('./')
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/stock/api': {
        target: 'http://localhost:5215',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stock\/api/, '')
      }
    }
  }
});
