/**
 * Vitest Configuration for Unit Tests
 *
 * Configures Vitest for running unit tests with appropriate timeouts,
 * test environment, and coverage settings.
 *
 * @module test
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test root directory
    root: resolve(__dirname),

    // Test environment
    environment: 'node',

    // Global setup/teardown
    globals: true,

    // Test timeouts
    testTimeout: 10000, // 10 seconds per test
    hookTimeout: 30000, // 30 seconds for beforeAll/afterAll hooks

    // Include unit tests
    include: ['unit/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: '../coverage/unit',
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
    },

    // Parallel execution
    pool: 'threads',

    // Reporter configuration
    reporters: ['verbose'],

    // Retry configuration
    retry: 0,

    // Sequence configuration
    sequence: {
      shuffle: false,
    },

    // Watch mode
    watchExclude: ['**/node_modules/**', '**/dist/**'],
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@test': resolve(__dirname, './'),
    },
  },
});
