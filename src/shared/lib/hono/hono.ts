import type { AppType } from '@/app/api/[[...route]]/route';
import { hc } from 'hono/client';

export const honoClient = hc<AppType>(process.env.NEXT_PUBLIC_API_HOST);

export type HonoClient = typeof honoClient;
