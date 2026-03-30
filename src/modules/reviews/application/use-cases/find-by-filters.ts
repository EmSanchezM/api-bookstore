import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReviewRepository } from '@/modules/reviews/domain/repositories';
import type { ReviewFilters } from '@/modules/reviews/infrastructure/types/review.filters';

@injectable()
export class FindByFiltersReviewUseCase {
  constructor(
    @inject(TYPES.ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async execute(filters: ReviewFilters) {
    return this.reviewRepository.getReviewsByFilters(filters);
  }
}
