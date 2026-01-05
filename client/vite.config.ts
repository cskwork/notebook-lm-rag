import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: ['notebooklm.agentic-worker.store'],
    proxy: {
      '/api': {
        target: 'http://localhost:5175',
        changeOrigin: true,
      },
    },
  },
})
