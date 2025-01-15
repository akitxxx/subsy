import { type Config, defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  verbose: true,
  strict: true,
  breakpoints: true,
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
}) satisfies Config;
