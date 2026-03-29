import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { CreateReviewDto } from '@/modules/reviews/application/dtos';
import { Review } from '@/modules/reviews/domain/entities';
import type { ReviewRepository } from '@/modules/reviews/domain/repositories';
import {
  ConflictException,
  InternalServerErrorException,
} from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class CreateReviewUseCase {
  constructor(
    @inject(TYPES.ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async execute(userId: string, createReviewDto: CreateReviewDto) {
    const existing =
      await this.reviewRepository.getReviewByUserAndBook(
        userId,
        createReviewDto.bookId,
      );

    if (existing)
      throw new ConflictException(
        'Ya existe una review activa para este libro por este usuario',
      );

    const review = new Review({
      id: generateUUID(),
      userId,
      bookId: createReviewDto.bookId,
      rating: createReviewDto.rating,
      title: createReviewDto.title,
      body: createReviewDto.body,
      parentId: createReviewDto.parentId ?? null,
      isActive: true,
    });

    const created = await this.reviewRepository.createReview(review);

    if (!created)
      throw new InternalServerErrorException('Error creating review');

    return created;
  }
}
