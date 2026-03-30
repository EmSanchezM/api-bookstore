import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingProgressRepository } from '@/modules/reading-progress/domain/repositories';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { type UserRole, ROLES } from '@/modules/shared/security/interfaces';

@injectable()
export class RemoveProgressUseCase {
  constructor(
    @inject(TYPES.ReadingProgressRepository)
    private readingProgressRepository: ReadingProgressRepository,
  ) {}

  async execute(id: string, userId: string, role?: UserRole) {
    const existing =
      await this.readingProgressRepository.getProgressById(id);

    if (!existing) throw new NotFoundException('Reading progress not found');

    if (role !== ROLES.ADMIN && existing.properties().userId !== userId)
      throw new ForbiddenException(
        'No tienes permiso para eliminar este progreso',
      );

    const deleted =
      await this.readingProgressRepository.deleteProgress(id);

    if (!deleted)
      throw new InternalServerErrorException(
        'Error deleting reading progress',
      );

    return deleted;
  }
}
