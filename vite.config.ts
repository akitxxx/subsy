import { defineConfig } from 'vite-plus';

export default defineConfig({
  resolve: {
    alias: { '@': './src' },
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/shared/test/setup.ts'],
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    maxWorkers: 1,
    maxConcurrency: 1,
  },
  lint: {
    plugins: ['typescript', 'import', 'react'],
    categories: { correctness: 'error', suspicious: 'warn' },
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
