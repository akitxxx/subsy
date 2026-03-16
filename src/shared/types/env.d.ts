/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_ENV: 'development' | 'staging' | 'production' | 'test';

    DATABASE_URL: string;

    // LINE
    LINE_CHANNEL_ACCESS_TOKEN: string;
    LINE_CHANNEL_SECRET: string;
    // Clerk
    CLERK_SECRET_KEY: string;
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    // OpenAI
    OPENAI_API_KEY: string;

    // ex. http://localhost:3000
    NEXT_PUBLIC_API_HOST: string;
  }
}
