import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/integration/**/*.e2e-spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'test/**',
        '**/*.spec.ts',
        '**/*.e2e-spec.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@/modules': path.resolve(__dirname, '../src/modules'),
      '@/common': path.resolve(__dirname, '../src/common'),
      '@/config': path.resolve(__dirname, '../src/config'),
    },
  },
});
