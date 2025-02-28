/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_ENV: 'development' | 'staging' | 'production' | 'test';

    DATABASE_URL: string;

    // LINE
    LINE_CHANNEL_ACCESS_TOKEN: string;

    AUTH_GOOGLE_CLIENT_ID: string;
    AUTH_GOOGLE_CLIENT_SECRET: string;

    // ex. http://localhost:3000
    NEXT_PUBLIC_API_HOST: string;
    // supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}
