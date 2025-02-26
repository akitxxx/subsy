import { type Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/api/shared/lib/db/schema.ts',
  out: './drizzle/migrations',
  verbose: true,
  strict: true,
  breakpoints: true,
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
}) satisfies Config;
