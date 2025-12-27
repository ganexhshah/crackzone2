import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Performance optimizations
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          auth: ['axios'],
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // Development server optimizations
  server: {
    port: 5173,
    host: true,
    // Enable HMR
    hmr: true,
    // Optimize deps
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react']
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services'),
      '@contexts': resolve(__dirname, 'src/contexts'),
    }
  },
  
  // CSS optimizations
  css: {
    devSourcemap: true
  }
})