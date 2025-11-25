import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'test/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/dto/**',
        '**/entities/**',
      ],
    },
    include: ['test/unit/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@dentalos/shared-types': path.resolve(__dirname, '../../../packages/shared-types/src'),
      '@dentalos/shared-validation': path.resolve(
        __dirname,
        '../../../packages/shared-validation/src',
      ),
      '@dentalos/shared-domain': path.resolve(__dirname, '../../../packages/shared-domain/src'),
      '@dentalos/shared-auth': path.resolve(__dirname, '../../../packages/shared-auth/src'),
      '@dentalos/shared-infra': path.resolve(__dirname, '../../../packages/shared-infra/src'),
      '@dentalos/shared-events': path.resolve(__dirname, '../../../packages/shared-events/src'),
      '@dentalos/shared-errors': path.resolve(__dirname, '../../../packages/shared-errors/src'),
      '@dentalos/shared-config': path.resolve(__dirname, '../../../packages/shared-config/src'),
      '@dentalos/shared-testing': path.resolve(__dirname, '../../../packages/shared-testing/src'),
    },
  },
});
