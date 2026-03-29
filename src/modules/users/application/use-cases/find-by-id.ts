import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { UserRepository } from '@/modules/users/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class FindByIdUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
  ) {}

  async execute(id: string) {
    const user = await this.userRepository.getUserById(id);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
