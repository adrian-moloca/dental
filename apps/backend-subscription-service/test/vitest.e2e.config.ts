/**
 * Vitest Configuration for E2E/Integration Tests
 *
 * Configuration for integration tests using testcontainers.
 * Spins up real PostgreSQL database for realistic testing.
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'backend-subscription-service:e2e',
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup/e2e-setup.ts'],
    include: ['test/integration/**/*.e2e.spec.ts', 'test/e2e/**/*.e2e.spec.ts'],
    exclude: ['test/unit/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/e2e',
      exclude: [
        'node_modules/**',
        'test/**',
        'dist/**',
        '**/*.spec.ts',
        '**/*.e2e.spec.ts',
        '**/migrations/**',
        '**/dto/**',
        '**/entities/**',
        '**/constants/**',
      ],
    },
    testTimeout: 120000, // 2 minutes for container startup
    hookTimeout: 120000,
    // Run tests sequentially to avoid database conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@test': path.resolve(__dirname),
    },
  },
});
