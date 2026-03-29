import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingProgressRepository } from '@/modules/reading-progress/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class FindByUserAndBookProgressUseCase {
  constructor(
    @inject(TYPES.ReadingProgressRepository)
    private readingProgressRepository: ReadingProgressRepository,
  ) {}

  async execute(userId: string, bookId: string) {
    const progress =
      await this.readingProgressRepository.getProgressByUserAndBook(
        userId,
        bookId,
      );

    if (!progress)
      throw new NotFoundException(
        'Reading progress not found for this book',
      );

    return progress;
  }
}
