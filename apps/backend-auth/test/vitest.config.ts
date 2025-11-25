/**
 * Vitest Configuration
 * Test runner configuration for backend-auth service
 *
 * @module backend-auth/test
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global setup and teardown
    setupFiles: ['./test/setup.ts'],

    // Test file patterns
    include: ['**/*.spec.ts', '**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.e2e.spec.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: '../coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/*.e2e.spec.ts',
        'src/**/index.ts',
        'src/**/*.interface.ts',
        'src/**/*.type.ts',
        'src/**/*.dto.ts',
      ],
      // Coverage thresholds
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },

    // Test timeout (30 seconds for integration tests)
    testTimeout: 30000,

    // Hooks timeout
    hookTimeout: 30000,

    // Globals (for describe, it, expect without imports)
    globals: true,

    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Reporter
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: '../test-results/unit-results.json',
      html: '../test-results/unit-results.html',
    },

    // Retry failed tests (useful for flaky tests, but aim for 0 flaky tests)
    retry: 0,

    // Watch mode configuration
    watch: false,

    // Bail on first failure in CI
    bail: process.env.CI ? 1 : 0,
  },

  // Module resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@test': path.resolve(__dirname, '.'),
    },
  },
});
