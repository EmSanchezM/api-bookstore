import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { UpdateReviewDto } from '@/modules/reviews/application/dtos';
import type { ReviewRepository } from '@/modules/reviews/domain/repositories';
import {
  DatabaseErrorException,
  ForbiddenException,
  NotFoundException,
} from '@/modules/shared/exceptions';

@injectable()
export class UpdateReviewUseCase {
  constructor(
    @inject(TYPES.ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async execute(id: string, userId: string, updateReviewDto: UpdateReviewDto) {
    const existing = await this.reviewRepository.getReviewById(id);

    if (!existing) throw new NotFoundException('Review not found');

    if (existing.properties().userId !== userId)
      throw new ForbiddenException(
        'No tienes permiso para actualizar esta review',
      );

    existing.update({
      rating: updateReviewDto.rating,
      title: updateReviewDto.title,
      body: updateReviewDto.body,
    });

    const updated = await this.reviewRepository.updateReview(
      existing.properties().id!,
      existing,
    );

    if (!updated)
      throw new DatabaseErrorException('Error updating review');

    return updated;
  }
}
