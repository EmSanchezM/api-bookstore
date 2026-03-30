import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { UserRepository } from '@/modules/users/domain/repositories';
import { type UserRole, ROLES } from '@/modules/shared/security/interfaces';
import {
  BadRequestException,
  DatabaseErrorException,
  NotFoundException,
} from '@/modules/shared/exceptions';

@injectable()
export class AssignRoleUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
  ) {}

  async execute(userId: string, role: UserRole) {
    const user = await this.userRepository.getUserById(userId);

    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.properties().role === ROLES.ADMIN && role !== ROLES.ADMIN) {
      const admins = await this.userRepository.getUsersByRole(ROLES.ADMIN);
      if (admins.length <= 1)
        throw new BadRequestException(
          'No se puede remover el último administrador',
        );
    }

    user.assignRole(role);

    const updated = await this.userRepository.updateUser(userId, user);

    if (!updated)
      throw new DatabaseErrorException('Error al asignar rol');

    return updated;
  }
}
