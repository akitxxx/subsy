import type { User } from '@supabase/supabase-js';

export type SessionUser = Pick<User, 'id'>;
