import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        xunlan: resolve(import.meta.dirname, 'xunlan/index.html'),
      },
    },
  },
  server: {
    port: mode === 'desktop' ? 5174 : 5173,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${mode === 'desktop' ? 8788 : 8787}`,
        changeOrigin: false,
      },
    },
  },
}))
