/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    APP_ENV: 'development' | 'staging' | 'production' | 'test';
    DATABASE_URL: string;
    AUTH_SECRET: string;
    AUTH_GOOGLE_CLIENT_ID: string;
    AUTH_GOOGLE_CLIENT_SECRET: string;
    NEXT_PUBLIC_API_URL: string;
  }
}
