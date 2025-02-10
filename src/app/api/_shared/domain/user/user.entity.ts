import { randomUUID } from 'node:crypto';
import type { InsertUser, InsertUserAuth, SelectUser, SelectUserAuth } from '@/lib/db/schema';

type UserCreateProps = Pick<InsertUser, 'nickname'> & { userAuth: Pick<InsertUserAuth, 'provider' | 'providerId'> };
const newUser = (p: UserCreateProps) => {
  const id = randomUUID();
  const now = new Date();
  return {
    id,
    nickname: p.nickname,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    userAuth: {
      userId: id,
      provider: p.userAuth.provider,
      providerId: p.userAuth.providerId,
      createdAt: now,
      updatedAt: now,
    },
  };
};

const updateProfile =
  (before: UserEntity) =>
  ({ nickname }: { nickname: string }): UserEntity => {
    return { ...before, nickname };
  };

export const User = {
  newUser,
  updateProfile,
};

export type UserEntity = Omit<SelectUser, 'deletedAt'>;
