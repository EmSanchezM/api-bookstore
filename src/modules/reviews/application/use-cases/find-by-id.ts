import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReviewRepository } from '@/modules/reviews/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class FindByIdReviewUseCase {
  constructor(
    @inject(TYPES.ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async execute(id: string) {
    const review = await this.reviewRepository.getReviewById(id);

    if (!review) throw new NotFoundException('Review not found');

    return review;
  }
}
