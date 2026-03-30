import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { RecommendationRepository } from '@/modules/recommendations/domain/repositories';

@injectable()
export class GetTrendingUseCase {
  constructor(
    @inject(TYPES.RecommendationRepository)
    private recommendationRepository: RecommendationRepository,
  ) {}

  async execute(limit: number = 10, days: number = 30) {
    return this.recommendationRepository.getTrending(limit, days);
  }
}
