import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingProgressRepository } from '@/modules/reading-progress/domain/repositories';

@injectable()
export class FindByUserIdProgressUseCase {
  constructor(
    @inject(TYPES.ReadingProgressRepository)
    private readingProgressRepository: ReadingProgressRepository,
  ) {}

  async execute(userId: string) {
    const progressList =
      await this.readingProgressRepository.getProgressByUserId(userId);

    if (!progressList.length) return [];

    return progressList;
  }
}
