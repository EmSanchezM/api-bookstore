import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { UpdateProgressDto } from '@/modules/reading-progress/application/dtos';
import type { ReadingProgressRepository } from '@/modules/reading-progress/domain/repositories';
import {
  DatabaseErrorException,
  ForbiddenException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { type UserRole, ROLES } from '@/modules/shared/security/interfaces';

@injectable()
export class UpdateProgressUseCase {
  constructor(
    @inject(TYPES.ReadingProgressRepository)
    private readingProgressRepository: ReadingProgressRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    updateProgressDto: UpdateProgressDto,
    role?: UserRole,
  ) {
    const existing =
      await this.readingProgressRepository.getProgressById(id);

    if (!existing) throw new NotFoundException('Reading progress not found');

    if (role !== ROLES.ADMIN && existing.properties().userId !== userId)
      throw new ForbiddenException(
        'No tienes permiso para actualizar este progreso',
      );

    existing.update({
      currentPage: updateProgressDto.currentPage,
      totalPages: updateProgressDto.totalPages,
      status: updateProgressDto.status,
    });

    const updated = await this.readingProgressRepository.updateProgress(
      existing.properties().id!,
      existing,
    );

    if (!updated)
      throw new DatabaseErrorException('Error updating reading progress');

    return updated;
  }
}
