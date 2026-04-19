import { defineConfig } from 'vite'

export default defineConfig({
  base: '/USTB_travelNet/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['d3', 'localforage']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})