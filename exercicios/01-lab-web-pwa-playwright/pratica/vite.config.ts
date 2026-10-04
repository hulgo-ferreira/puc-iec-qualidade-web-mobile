import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    // espelha o paths do tsconfig — @/ = src/
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt': o SW novo espera e o app mostra "Nova versão — Atualizar"
      // (UpdateToast). Em vez de trocar no meio do uso, o usuário escolhe.
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        id: '/',
        name: 'CineFav — filmes favoritos',
        short_name: 'CineFav',
        description: 'Catálogo de filmes com favoritos — funciona offline',
        lang: 'pt-BR',
        theme_color: '#0b0f1a',
        background_color: '#0b0f1a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['entertainment', 'movies'],
        // Atalhos: pressionar e segurar o ícone do app (Android/desktop) mostra estes links.
        shortcuts: [
          { name: 'Meus favoritos', short_name: 'Favoritos', url: '/favorites', icons: [{ src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' }] },
          { name: 'Buscar filmes', short_name: 'Buscar', url: '/search', icons: [{ src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' }] },
        ],
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Com registerType 'prompt' o clientsClaim não é implícito: sem isto o
        // 1º SW não controla a página que o instalou (e o spec 05 não passa).
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        // O catálogo vem de /api/movies.json (arquivo estático servido junto com o app).
        // NetworkFirst: online busca a versão fresca; offline cai no cache.
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*\.json/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cinefav-api',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          // Posters do TMDB: CacheFirst — viu uma vez, abre offline pra sempre.
          // A imagem vem de outro domínio sem CORS (resposta "opaca", status 0),
          // por isso statuses [0, 200]. Limite de 80 pra não encher o disco.
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cinefav-posters',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
