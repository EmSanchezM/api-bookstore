import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { RecommendationRepository } from '@/modules/recommendations/domain/repositories';

@injectable()
export class GetCollaborativeRecommendationsUseCase {
  constructor(
    @inject(TYPES.RecommendationRepository)
    private recommendationRepository: RecommendationRepository,
  ) {}

  async execute(bookId: string, limit: number = 10) {
    return this.recommendationRepository.getCollaborativeRecommendations(
      bookId,
      limit,
    );
  }
}
