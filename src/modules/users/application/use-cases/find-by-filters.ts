import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { UserRepository } from '@/modules/users/domain/repositories';
import type { UserFilters } from '@/modules/users/infrastructure/types/user.filters';

@injectable()
export class FindByFiltersUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
  ) {}

  async execute(filters: UserFilters) {
    const users = await this.userRepository.getUsersByFilters(filters);

    if (!users.length) return [];

    return users;
  }
}
