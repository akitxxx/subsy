import type { SelectUser } from '@/lib/db/schema';

export type UserEntity = Omit<SelectUser, 'deletedAt'>;
