import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { UpdateProfileDto } from '@/modules/users/application/dtos';
import type { UserRepository } from '@/modules/users/domain/repositories';
import {
  DatabaseErrorException,
  NotFoundException,
} from '@/modules/shared/exceptions';

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
  ) {}

  async execute(id: string, updateProfileDto: UpdateProfileDto) {
    const existingUser = await this.userRepository.getUserById(id);

    if (!existingUser) throw new NotFoundException('User not found');

    existingUser.update({
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
      email: updateProfileDto.email,
      avatar: updateProfileDto.avatar,
      bio: updateProfileDto.bio,
    });

    const updatedUser = await this.userRepository.updateUser(
      existingUser.properties().id!,
      existingUser,
    );

    if (!updatedUser) throw new DatabaseErrorException('Error updating user');

    return updatedUser;
  }
}
