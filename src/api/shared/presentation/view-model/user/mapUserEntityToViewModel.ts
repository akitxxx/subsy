import type { UserEntity } from '@/api/shared/domain/user';
import type { UserViewModel } from '@/shared/domain/user/user.viewModel';

export const mapUserEntityToViewModel = (entity: UserEntity): UserViewModel => {
  return { ...entity };
};

export const mapUserEntitiesToViewModels = (entities: UserEntity[]): UserViewModel[] => {
  return entities.map(mapUserEntityToViewModel);
};
