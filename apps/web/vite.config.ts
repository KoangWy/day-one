import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    manifest: {
      name: 'Offixed Day One Navigation', short_name: 'Day One',
      description: 'A familiar route, one confirmed checkpoint at a time.',
      theme_color: '#153f34', background_color: '#f5f3ec',
      display: 'standalone', start_url: '/',
      icons: [192, 512].map(size => ({ src: `/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })),
    },
    workbox: {
      // App shell only. Never cache API responses, audio, images, model or WASM.
      globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
      globIgnores: ['privacy/**'],
      navigateFallbackDenylist: [/^\/(routes|replay|ingest-video|audio|health|docs|openapi.json|privacy)(\/|$)/],
      runtimeCaching: [], cleanupOutdatedCaches: true,
    },
  })],
  server: { proxy: Object.fromEntries(['/routes', '/replay', '/audio', '/health', '/ingest-video'].map(
    path => [path, 'http://127.0.0.1:8000']
  )) },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
})
