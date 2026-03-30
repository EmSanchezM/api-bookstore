import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingProgressRepository } from '@/modules/reading-progress/domain/repositories';
import type { ReadingProgressFilters } from '@/modules/reading-progress/infrastructure/types/reading-progress.filters';

@injectable()
export class FindByFiltersProgressUseCase {
  constructor(
    @inject(TYPES.ReadingProgressRepository)
    private readingProgressRepository: ReadingProgressRepository,
  ) {}

  async execute(filters: ReadingProgressFilters) {
    const progressList =
      await this.readingProgressRepository.getProgressByFilters(filters);

    if (!progressList.length) return [];

    return progressList;
  }
}
