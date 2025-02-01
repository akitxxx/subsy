import type { AppType } from '@/app/api/[[...route]]/route';
import { hc } from 'hono/client';

export const honoClient = hc<AppType>('http://localhost:3000');

export type HonoClient = typeof honoClient;
