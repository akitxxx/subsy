import { getCurrentUserHandler } from '@/api/features/user/get-current-user/getCurrentUser.handler';
import { updateProfileHandler } from '@/api/features/user/update-profile/updateProfile.handler';
import type { HonoEnv } from '@/api/shared/types/hono';
import { Hono } from 'hono';

const app = new Hono<HonoEnv>();

const route = app.get('/me', ...getCurrentUserHandler).patch('/me', ...updateProfileHandler);

export default route;
