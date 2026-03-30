import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { RecommendationRepository } from '@/modules/recommendations/domain/repositories';

@injectable()
export class GetSimilarBooksUseCase {
  constructor(
    @inject(TYPES.RecommendationRepository)
    private recommendationRepository: RecommendationRepository,
  ) {}

  async execute(userId: string, bookId: string, limit: number = 10) {
    return this.recommendationRepository.getSimilarBooks(
      userId,
      bookId,
      limit,
    );
  }
}
