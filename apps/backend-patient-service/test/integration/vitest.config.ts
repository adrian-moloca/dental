/**
 * Vitest Configuration for Integration Tests
 *
 * Configures Vitest for running integration tests with appropriate timeouts,
 * test environment, and coverage settings.
 *
 * @module test/integration
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global setup/teardown
    globals: true,

    // Test timeouts (MongoDB Memory Server can be slow on first run)
    testTimeout: 30000, // 30 seconds per test
    hookTimeout: 60000, // 60 seconds for beforeAll/afterAll hooks

    // Include only integration tests
    include: ['**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: '../../coverage/integration',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/**/*.interface.ts',
        'src/**/*.dto.ts',
        'src/**/*.entity.ts',
        'src/**/*.schema.ts',
      ],
      // Coverage thresholds
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },

    // Parallel execution
    pool: 'forks',
    poolOptions: {
      forks: {
        // Run tests sequentially to avoid MongoDB Memory Server conflicts
        singleFork: true,
      },
    },

    // Reporter configuration
    reporters: ['verbose'],

    // Retry configuration
    retry: 0, // Don't retry flaky tests

    // Sequence configuration
    sequence: {
      shuffle: false, // Run tests in order for consistency
    },

    // Watch mode
    watchExclude: ['**/node_modules/**', '**/dist/**'],
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@test': resolve(__dirname, '../'),
    },
  },
});
