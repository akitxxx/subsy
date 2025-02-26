import type { SelectUser } from '@/api/shared/lib/db/schema';

export type CurrentUser = Omit<SelectUser, 'deletedAt'>;
