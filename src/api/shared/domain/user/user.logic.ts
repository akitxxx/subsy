import { randomUUID } from 'node:crypto';
import type { SelectUser } from '@/api/shared/lib/db/schema';
import { DateUtils } from '@/shared/utils/date.util';
import type { UserAuthEntity, UserEntity } from './user.entity';

type UserCreateProps = { userAuth: Pick<UserAuthEntity, 'provider' | 'providerId'> };
const newUser = (p: UserCreateProps) => {
  const id = randomUUID();
  const now = DateUtils.create.now();
  return {
    id,
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
  newUser,
  parseEntity,
};
