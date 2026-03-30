import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReviewRepository } from '@/modules/reviews/domain/repositories';

@injectable()
export class FindByBookIdReviewUseCase {
  constructor(
    @inject(TYPES.ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async execute(bookId: string) {
    return this.reviewRepository.getReviewsByBookId(bookId);
  }
}
