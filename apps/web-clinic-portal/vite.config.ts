import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// Force clear cache on startup
const clearViteCache = () => {
  const cacheDir = '/tmp/vite-cache'
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
  server: {
    watch: {
      usePolling: true,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
    host: '0.0.0.0',
    strictPort: false,
    port: 5173,
    middlewareMode: false,
    hmr: {
      host: 'localhost',
      port: 5173,
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
  cacheDir: '/tmp/vite-cache',
  define: {
    'import.meta.env.VITE_AUTH_API_URL': JSON.stringify(process.env.VITE_AUTH_API_URL),
    'import.meta.env.VITE_PATIENT_API_URL': JSON.stringify(process.env.VITE_PATIENT_API_URL),
    'import.meta.env.VITE_PROVIDER_API_URL': JSON.stringify(process.env.VITE_PROVIDER_API_URL),
    'import.meta.env.VITE_SCHEDULING_API_URL': JSON.stringify(process.env.VITE_SCHEDULING_API_URL),
    'import.meta.env.VITE_CLINICAL_API_URL': JSON.stringify(process.env.VITE_CLINICAL_API_URL),
    'import.meta.env.VITE_BILLING_API_URL': JSON.stringify(process.env.VITE_BILLING_API_URL),
    'import.meta.env.VITE_INVENTORY_API_URL': JSON.stringify(process.env.VITE_INVENTORY_API_URL),
    'import.meta.env.VITE_ENTERPRISE_API_URL': JSON.stringify(process.env.VITE_ENTERPRISE_API_URL),
    'import.meta.env.VITE_HEALTH_AGGREGATOR_URL': JSON.stringify(process.env.VITE_HEALTH_AGGREGATOR_URL),
    'import.meta.env.VITE_IMAGING_API_URL': JSON.stringify(process.env.VITE_IMAGING_API_URL),
    // Add build timestamp for cache busting
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
})
