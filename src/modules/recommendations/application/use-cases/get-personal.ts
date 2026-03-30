import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { RecommendationRepository } from '@/modules/recommendations/domain/repositories';

@injectable()
export class GetPersonalRecommendationsUseCase {
  constructor(
    @inject(TYPES.RecommendationRepository)
    private recommendationRepository: RecommendationRepository,
  ) {}

  async execute(userId: string, limit: number = 10) {
    return this.recommendationRepository.getPersonalRecommendations(
      userId,
      limit,
    );
  }
}
