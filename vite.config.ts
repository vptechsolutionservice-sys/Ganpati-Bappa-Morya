import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'images/*', 'songs/*'],
      devOptions: {
        enabled: true,
      },
      manifest: {
        id: '/',
        name: 'Ganpati Invitation — बाप्पांचे आमंत्रण',
        short_name: 'गणपती आमंत्रण',
        description: 'Create beautiful personalized Ganpati invitations.',
        theme_color: '#fdf0dc',
        background_color: '#fdf0dc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
