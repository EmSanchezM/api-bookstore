import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { RecommendationRepository } from '@/modules/recommendations/domain/repositories';

@injectable()
export class GetPopularByCategoryUseCase {
  constructor(
    @inject(TYPES.RecommendationRepository)
    private recommendationRepository: RecommendationRepository,
  ) {}

  async execute(category: string, limit: number = 10) {
    return this.recommendationRepository.getPopularByCategory(category, limit);
  }
}
