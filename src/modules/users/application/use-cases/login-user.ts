import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { LoginUserDto } from '@/modules/users/application/dtos';
import type { UserRepository } from '@/modules/users/domain/repositories';
import { UnauthorizedException } from '@/modules/shared/exceptions';
import type { PasswordHasher } from '@/modules/shared/security/interfaces';
import type { TokenProvider } from '@/modules/shared/security/interfaces';

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.PasswordHasher) private passwordHasher: PasswordHasher,
    @inject(TYPES.TokenProvider) private tokenProvider: TokenProvider,
  ) {}

  async execute(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.getUserByEmail(loginUserDto.email);

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isValidPassword = await this.passwordHasher.verify(
      loginUserDto.password,
      user.properties().passwordHash,
    );

    if (!isValidPassword)
      throw new UnauthorizedException('Credenciales inválidas');

    const token = await this.tokenProvider.sign({
      id: user.properties().id!,
      email: user.properties().email,
      role: user.properties().role,
    });

    return { token, user };
  }
}
