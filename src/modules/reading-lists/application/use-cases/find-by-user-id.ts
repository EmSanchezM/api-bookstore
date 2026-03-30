import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingListRepository } from '@/modules/reading-lists/domain/repositories';

@injectable()
export class FindByUserIdReadingListUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
  ) {}

  async execute(userId: string) {
    const readingLists =
      await this.readingListRepository.getReadingListsByUserId(userId);

    if (!readingLists.length) return [];

    return readingLists;
  }
}
