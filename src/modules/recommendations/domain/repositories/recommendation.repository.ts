import type { RecommendedBook } from '../types';

export interface RecommendationRepository {
  getCollaborativeRecommendations(
    bookId: string,
    limit: number,
  ): Promise<RecommendedBook[]>;

  getPersonalRecommendations(
    userId: string,
    limit: number,
  ): Promise<RecommendedBook[]>;

  getPopularByCategory(
    category: string,
    limit: number,
  ): Promise<RecommendedBook[]>;

  getTrending(limit: number, days: number): Promise<RecommendedBook[]>;

  getSimilarBooks(
    userId: string,
    bookId: string,
    limit: number,
  ): Promise<RecommendedBook[]>;
}
