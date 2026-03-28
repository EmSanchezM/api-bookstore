import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { RegisterUserDto } from '@/modules/users/application/dtos';
import { User } from '@/modules/users/domain/entities';
import type { UserRepository } from '@/modules/users/domain/repositories';
import {
  ConflictException,
  InternalServerErrorException,
} from '@/modules/shared/exceptions';
import type { PasswordHasher } from '@/modules/shared/security/interfaces';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.PasswordHasher) private passwordHasher: PasswordHasher,
  ) {}

  async execute(registerUserDto: RegisterUserDto) {
    const existingUser = await this.userRepository.getUserByEmail(
      registerUserDto.email,
    );

    if (existingUser)
      throw new ConflictException('El email ya está registrado');

    const passwordHash = await this.passwordHasher.hash(
      registerUserDto.password,
    );

    const user = new User({
      id: generateUUID(),
      firstName: registerUserDto.firstName,
      lastName: registerUserDto.lastName,
      email: registerUserDto.email,
      passwordHash,
      isActive: true,
    });

    const createdUser = await this.userRepository.createUser(user);

    if (!createdUser)
      throw new InternalServerErrorException('Error creating user');

    return createdUser;
  }
}
