import { userModelBaseSchema } from '@/app/api/_shared/domain/user/user.entity';
import type { z } from 'zod';

// ViewModel
const userViewModelSchema = userModelBaseSchema;

export type UserViewModel = z.infer<typeof userViewModelSchema>;
