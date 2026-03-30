import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingProgressRepository } from '@/modules/reading-progress/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class FindByIdProgressUseCase {
  constructor(
    @inject(TYPES.ReadingProgressRepository)
    private readingProgressRepository: ReadingProgressRepository,
  ) {}

  async execute(id: string) {
    const progress = await this.readingProgressRepository.getProgressById(id);

    if (!progress) throw new NotFoundException('Reading progress not found');

    return progress;
  }
}
