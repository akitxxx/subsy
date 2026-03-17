import path from 'node:path';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  test: {
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    maxWorkers: 1,
    maxConcurrency: 1,
    projects: [
      {
        // バックエンド + shared テスト（node環境）
        resolve: {
          alias: { '@': path.resolve(import.meta.dirname, 'src') },
        },
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          include: ['src/api/**/*.spec.{ts,tsx}', 'src/shared/**/*.spec.{ts,tsx}'],
          setupFiles: ['./src/shared/test/setup.node.ts'],
        },
      },
      {
        // フロントエンドテスト（jsdom環境）
        resolve: {
          alias: { '@': path.resolve(import.meta.dirname, 'src') },
        },
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          globals: true,
          include: ['src/web/**/*.spec.{ts,tsx}'],
          setupFiles: ['./src/shared/test/setup.jsdom.ts'],
        },
      },
    ],
  },
  lint: {
    plugins: ['typescript', 'import', 'react'],
    categories: { correctness: 'error', suspicious: 'warn' },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      eqeqeq: 'warn',
      'react-in-jsx-scope': 'off',
      'no-shadow': 'off',
      'no-unused-expressions': 'off',
      'no-unassigned-import': 'off',
    },
    ignorePatterns: ['node_modules', '.next', 'drizzle'],
  },
  fmt: {
    printWidth: 150,
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
  },
  staged: {
    '*.{js,ts,cjs,mjs,jsx,tsx,json,jsonc,css}': 'vp check --fix',
  },
});
