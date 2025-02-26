import type { SelectUser, SelectUserAuth } from '@/api/shared/lib/db/schema';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
import { z } from 'zod';

// BaseSchema
export const userModelBaseSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
}) satisfies z.ZodType<SelectUser>;

// Entity
export type UserEntity = z.infer<typeof userModelBaseSchema>;

// AuthBaseSchema
export const userAuthModelBaseSchema = z.object({
  userId: z.string(),
  provider: z.nativeEnum(ProviderEnum),
  providerId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<SelectUserAuth>;

// Entity
export type UserAuthEntity = z.infer<typeof userAuthModelBaseSchema>;
