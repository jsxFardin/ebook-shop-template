import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) =>
          id.includes('node_modules/swiper') ? 'swiper'
          : id.includes('node_modules') ? 'vendor'
          : id.includes('/src/data/products.json') ? 'catalog'
          : undefined,
      },
    },
  },
})
