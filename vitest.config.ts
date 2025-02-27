import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/shared/test/setup.ts'],
    globals: true,
    sequence: {
      concurrent: false,
    },
    restoreMocks: true,
  },
});
