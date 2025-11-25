/**
 * Vitest Configuration for Unit Tests
 *
 * Configuration for fast unit tests with mocking support.
 * No database or external dependencies required.
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'backend-subscription-service:unit',
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup/unit-setup.ts'],
    include: ['test/unit/**/*.spec.ts'],
    exclude: ['test/integration/**', 'test/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/unit',
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
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@test': path.resolve(__dirname),
    },
  },
});
