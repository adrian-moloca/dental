/**
 * Vitest E2E Configuration
 * Integration/E2E test runner configuration for backend-auth service
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

    // Test file patterns (E2E tests only)
    include: ['**/*.e2e.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: '../coverage-e2e',
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
    },

    // Test timeout (60 seconds for E2E tests)
    testTimeout: 60000,

    // Hooks timeout
    hookTimeout: 60000,

    // Globals (for describe, it, expect without imports)
    globals: true,

    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // Sequential execution (E2E tests may share resources)
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Run E2E tests sequentially
      },
    },

    // Reporter
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: '../test-results/e2e-results.json',
      html: '../test-results/e2e-results.html',
    },

    // Retry failed tests (E2E tests may be flaky due to timing)
    retry: process.env.CI ? 2 : 0,

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
