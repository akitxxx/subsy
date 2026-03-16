if (typeof window !== 'undefined') {
  // フロントエンドテスト: jest-dom マッチャーを追加
  const matchers = await import('@testing-library/jest-dom/matchers');
  expect.extend(matchers.default ?? matchers);
} else {
  // バックエンドテスト: DB接続設定
  const dotenv = await import('dotenv');
  const wsModule = await import('ws');

  dotenv.config({
    path: '.env.test',
  });

  // Vite の静的解析による jsdom 環境でのモジュール解決を回避するため、動的パスを使用
  const neonLocalPath = ['@', 'api', 'shared', 'lib', 'db', 'neonLocal'].join('/');
  const { configureNeonLocal } = await import(/* @vite-ignore */ neonLocalPath);
  configureNeonLocal({ wsConstructor: wsModule.default });
}
