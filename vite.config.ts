import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/predictions': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/admin': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/data': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/wc': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
