import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import dashboard from './_dashboard/route';

const app = new Hono().basePath('/api');
const route = app.route('/dashboard', dashboard);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof route;
