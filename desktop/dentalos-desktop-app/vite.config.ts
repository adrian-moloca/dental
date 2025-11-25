import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';
import fs from 'fs';

// Force clear cache on startup
const clearViteCache = () => {
  const cacheDir = '.vite'
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

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/main.ts',
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: 'dist/main',
            rollupOptions: {
              external: ['electron', 'keytar', 'node-machine-id', 'systeminformation']
            }
          }
        }
      },
      {
        entry: 'src/main/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist/preload'
          }
        }
      }
    ])
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    watch: {
      usePolling: true,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    },
  },
  optimizeDeps: {
    force: true,
    noDiscovery: false,
  },
  build: {
    outDir: 'dist/renderer',
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html')
    }
  }
});
