import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReviewRepository } from '@/modules/reviews/domain/repositories';

@injectable()
export class GetBookRatingUseCase {
  constructor(
    @inject(TYPES.ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async execute(bookId: string) {
    return this.reviewRepository.getAverageRatingByBookId(bookId);
  }
}
