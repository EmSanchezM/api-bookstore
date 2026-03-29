import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingListRepository } from '@/modules/reading-lists/domain/repositories';
import type { ReadingListFilters } from '@/modules/reading-lists/infrastructure/types/reading-list.filters';

@injectable()
export class FindByFiltersReadingListUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
  ) {}

  async execute(filters: ReadingListFilters) {
    const readingLists =
      await this.readingListRepository.getReadingListsByFilters(filters);

    if (!readingLists.length) return [];

    return readingLists;
  }
}
