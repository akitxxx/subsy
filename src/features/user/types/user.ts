import type { SelectUser } from '@/lib/db/schema';

export type CurrentUser = Omit<SelectUser, 'deletedAt'>;

export type UseCurrentUserReturn = {
  user: CurrentUser | undefined;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<CurrentUser | undefined>;
};
