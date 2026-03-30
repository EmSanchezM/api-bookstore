import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingListRepository } from '@/modules/reading-lists/domain/repositories';

@injectable()
export class FindPublicReadingListsUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
  ) {}

  async execute() {
    const readingLists =
      await this.readingListRepository.getPublicReadingLists();

    if (!readingLists.length) return [];

    return readingLists;
  }
}
