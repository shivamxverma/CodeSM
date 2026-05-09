import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// https://vite.dev/config/

export default defineConfig({
  proxy: {
    '/api': 'http://localhost:8000',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist'
  },
  server: {
    historyApiFallback: true,
    host: '0.0.0.0',
    // Allow Docker container hostnames (e.g. 'frontend' in docker-compose.e2e.yml).
    // Vite 6 introduced host-based security; without this, the Playwright
    // container gets "Blocked request. This host is not allowed."
    // Set to true to allow all hosts (safe in a closed Docker E2E environment).
    allowedHosts: true,
  }
})
