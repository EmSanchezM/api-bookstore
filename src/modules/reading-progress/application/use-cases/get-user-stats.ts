import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingProgressRepository } from '@/modules/reading-progress/domain/repositories';

@injectable()
export class GetUserStatsUseCase {
  constructor(
    @inject(TYPES.ReadingProgressRepository)
    private readingProgressRepository: ReadingProgressRepository,
  ) {}

  async execute(userId: string) {
    return this.readingProgressRepository.getUserStats(userId);
  }
}
