import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReviewRepository } from '@/modules/reviews/domain/repositories';

@injectable()
export class FindRepliesByReviewIdUseCase {
  constructor(
    @inject(TYPES.ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async execute(reviewId: string) {
    return this.reviewRepository.getRepliesByReviewId(reviewId);
  }
}
