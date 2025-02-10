import type { SelectUser, SelectUserAuth } from '@/lib/db/schema';

const updateProfile =
  (before: UserEntity) =>
  ({ nickname }: { nickname: string }): UserEntity => {
    return { ...before, nickname };
  };

export const User = (before: UserEntity) => ({
  updateProfile: updateProfile(before),
});

export type UserEntity = Omit<SelectUser, 'deletedAt'>;
