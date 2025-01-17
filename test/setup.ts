import { config } from 'dotenv';
import { beforeAll } from 'vitest';

// vitest.config.tsでsetupFilesを指定しているので、このファイルは自動的に読み込まれる
(() => {
  // テスト用の環境変数を読み込む
  config({ path: '.env.test' });
  console.log('DATABASE_URL', process.env.DATABASE_URL);
})();
