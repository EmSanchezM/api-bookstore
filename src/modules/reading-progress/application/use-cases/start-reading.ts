import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { StartReadingDto } from '@/modules/reading-progress/application/dtos';
import { ReadingProgress } from '@/modules/reading-progress/domain/entities';
import type { ReadingProgressRepository } from '@/modules/reading-progress/domain/repositories';
import {
  ConflictException,
  InternalServerErrorException,
} from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class StartReadingUseCase {
  constructor(
    @inject(TYPES.ReadingProgressRepository)
    private readingProgressRepository: ReadingProgressRepository,
  ) {}

  async execute(userId: string, startReadingDto: StartReadingDto) {
    const existing =
      await this.readingProgressRepository.getProgressByUserAndBook(
        userId,
        startReadingDto.bookId,
      );

    if (existing)
      throw new ConflictException(
        'Ya existe un registro de progreso para este libro',
      );

    const progress = new ReadingProgress({
      id: generateUUID(),
      userId,
      bookId: startReadingDto.bookId,
      status: startReadingDto.status ?? 'want_to_read',
      totalPages: startReadingDto.totalPages,
      isActive: true,
      startedAt:
        startReadingDto.status === 'reading' ? new Date() : null,
    });

    const created =
      await this.readingProgressRepository.createProgress(progress);

    if (!created)
      throw new InternalServerErrorException(
        'Error creating reading progress',
      );

    return created;
  }
}
