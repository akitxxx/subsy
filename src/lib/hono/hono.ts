import type { AppType } from '@/app/api/[[...route]]/route';
import { hc } from 'hono/client';

export const hono = hc<AppType>('/');

export type HonoClient = typeof hono;
