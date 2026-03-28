import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { UserRepository } from '@/modules/users/domain/repositories';

@injectable()
export class FindAllUsersUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
  ) {}

  async execute() {
    const users = await this.userRepository.getAllUsers();

    if (!users.length) return [];

    return users;
  }
}
