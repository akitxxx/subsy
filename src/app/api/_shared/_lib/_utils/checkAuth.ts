import { UnauthorizedError } from '@/app/api/_shared/_error';
import type { User } from '@supabase/supabase-js';

export const checkAuth = (authUser: User | null): User => {
  if (!authUser) throw new UnauthorizedError();
  return authUser;
};
