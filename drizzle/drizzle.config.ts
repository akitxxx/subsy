import { type Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  verbose: true,
  strict: true,
}) satisfies Config;
