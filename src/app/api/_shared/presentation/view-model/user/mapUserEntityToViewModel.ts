import type { UserEntity } from '@/app/api/_shared/domain/user/user.entity';
import type { UserViewModel } from '@/domain/user/user.viewModel';

export const mapUserEntityToViewModel = (entity: UserEntity): UserViewModel => {
  return { ...entity };
};

export const mapUserEntitiesToViewModels = (entities: UserEntity[]): UserViewModel[] => {
  return entities.map(mapUserEntityToViewModel);
};
