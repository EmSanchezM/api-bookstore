export type RecommendationReason =
  | 'users_also_liked'
  | 'personal_history'
  | 'popular_in_category'
  | 'trending'
  | 'similar_to_book';

export interface RecommendedBook {
  bookId: string;
  title: string;
  isbn: string;
  score: number;
  avgRating?: number;
  reason: RecommendationReason;
}
