import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReviewRepository } from '@/modules/reviews/domain/repositories';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { type UserRole, ROLES } from '@/modules/shared/security/interfaces';

@injectable()
export class RemoveReviewUseCase {
  constructor(
    @inject(TYPES.ReviewRepository)
    private reviewRepository: ReviewRepository,
  ) {}

  async execute(id: string, userId: string, role?: UserRole) {
    const existing = await this.reviewRepository.getReviewById(id);

    if (!existing) throw new NotFoundException('Review not found');

    if (role !== ROLES.ADMIN && existing.properties().userId !== userId)
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta review',
      );

    const deleted = await this.reviewRepository.deleteReview(id);

    if (!deleted)
      throw new InternalServerErrorException('Error deleting review');

    return deleted;
  }
}
