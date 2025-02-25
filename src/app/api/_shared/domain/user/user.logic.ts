import { randomUUID } from 'node:crypto';
import { DateUtils } from '@/lib/date.util';
import type { SelectUser } from '@/lib/db/schema';
import type { UserAuthEntity, UserEntity } from './user.entity';

const updateProfile =
  (before: UserEntity) =>
  ({ nickname }: { nickname: string }): UserEntity => {
    return { ...before, nickname };
  };

type UserCreateProps = Pick<UserEntity, 'nickname'> & { userAuth: Pick<UserAuthEntity, 'provider' | 'providerId'> };
const newUser = (p: UserCreateProps) => {
  const id = randomUUID();
  const now = DateUtils.create.now();
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

const parseEntity = (data: SelectUser): UserEntity => {
  return { ...data };
};

export const User = {
  updateProfile,
  newUser,
  parseEntity,
};
