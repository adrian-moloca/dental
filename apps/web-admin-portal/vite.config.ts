import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Force clear cache on startup
const clearViteCache = () => {
  const cacheDir = '/tmp/vite-cache-admin'
  try {
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true })
      console.log('[CACHE] Vite cache cleared')
    }
  } catch (err) {
    console.warn('[CACHE] Failed to clear cache:', err)
  }
}

clearViteCache()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@api': path.resolve(__dirname, './src/api'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@routes': path.resolve(__dirname, './src/routes'),
    },
  },
  server: {
    watch: {
      usePolling: true,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
    host: '0.0.0.0',
    strictPort: false,
    port: 5174,
    middlewareMode: false,
    hmr: {
      host: 'localhost',
      port: 5174,
      protocol: 'ws',
      overlay: true,
    },
  },
  // Force cache bypass - critical for Docker development
  optimizeDeps: {
    force: true,
    noDiscovery: false,
  },
  // Store cache in temp location (not mounted volume)
  cacheDir: '/tmp/vite-cache-admin',
  define: {
    'import.meta.env.VITE_AUTH_API_URL': JSON.stringify(process.env.VITE_AUTH_API_URL),
    'import.meta.env.VITE_ENTERPRISE_API_URL': JSON.stringify(process.env.VITE_ENTERPRISE_API_URL),
    'import.meta.env.VITE_SUBSCRIPTION_API_URL': JSON.stringify(process.env.VITE_SUBSCRIPTION_API_URL),
    'import.meta.env.VITE_HEALTH_AGGREGATOR_URL': JSON.stringify(process.env.VITE_HEALTH_AGGREGATOR_URL),
    // Add build timestamp for cache busting
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
})
