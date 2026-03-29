import type { Review } from '@/modules/reviews/domain/entities';
import type { ReviewFilters } from '@/modules/reviews/infrastructure/types/review.filters';

export interface ReviewRepository {
  getReviewById(id: string): Promise<Review | null>;
  getReviewByUserAndBook(userId: string, bookId: string): Promise<Review | null>;
  getReviewsByBookId(bookId: string): Promise<Review[]>;
  getReviewsByUserId(userId: string): Promise<Review[]>;
  getRepliesByReviewId(reviewId: string): Promise<Review[]>;
  getReviewsByFilters(filters: ReviewFilters): Promise<Review[]>;
  createReview(review: Review): Promise<Review | null>;
  updateReview(id: string, review: Review): Promise<Review | null>;
  deleteReview(id: string): Promise<boolean>;
  getAverageRatingByBookId(
    bookId: string,
  ): Promise<{ average: number; count: number }>;
}
