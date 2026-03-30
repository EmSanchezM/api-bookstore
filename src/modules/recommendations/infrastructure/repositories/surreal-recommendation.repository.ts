import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type { Surreal } from 'surrealdb';
import { type RecordId, ResponseError } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';
import type { RecommendationRepository } from '@/modules/recommendations/domain/repositories';
import type {
  RecommendationReason,
  RecommendedBook,
} from '@/modules/recommendations/domain/types';

interface BookRecord {
  id: RecordId | string;
  title: string;
  isbn: string;
  [key: string]: unknown;
}

interface CollaborativeResult {
  book: RecordId | string | BookRecord;
  score: number;
  [key: string]: unknown;
}

interface TrendingResult {
  book: RecordId | string | BookRecord;
  activity: number;
  avg_rating: number;
  [key: string]: unknown;
}

interface PopularResult {
  book: RecordId | string | BookRecord;
  frequency: number;
  [key: string]: unknown;
}

@injectable()
export class SurrealRecommendationRepository
  implements RecommendationRepository
{
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getCollaborativeRecommendations(
    bookId: string,
    limit: number,
  ): Promise<RecommendedBook[]> {
    try {
      const bookRecordId = toRecordId('book', bookId);

      const [response] = await this.db.query<CollaborativeResult[]>(
        `SELECT out as book, count() as score
        FROM reviewed
        WHERE in IN (
          SELECT VALUE in FROM reviewed WHERE out = $book AND rating >= 4
        ) AND out != $book AND rating >= 4
        GROUP BY book
        ORDER BY score DESC
        LIMIT $limit
        FETCH book`,
        { book: bookRecordId, limit },
      );

      if (!Array.isArray(response) || !response.length) return [];

      return response
        .map((record) =>
          this.mapToRecommendedBook(record.book, record.score, 'users_also_liked'),
        )
        .filter((r): r is RecommendedBook => r !== null);
    } catch (error) {
      this.handleError(error, 'getCollaborativeRecommendations');
    }
  }

  async getPersonalRecommendations(
    userId: string,
    limit: number,
  ): Promise<RecommendedBook[]> {
    try {
      const userRecordId = toRecordId('user', userId);

      const [response] = await this.db.query<CollaborativeResult[]>(
        `SELECT out as book, count() as score
        FROM reviewed
        WHERE in IN (
          SELECT VALUE in FROM reviewed
          WHERE out IN (SELECT VALUE out FROM reviewed WHERE in = $user AND rating >= 4)
            AND in != $user
        )
        AND out NOT IN (SELECT VALUE out FROM reviewed WHERE in = $user)
        AND rating >= 4
        GROUP BY book
        ORDER BY score DESC
        LIMIT $limit
        FETCH book`,
        { user: userRecordId, limit },
      );

      if (!Array.isArray(response) || !response.length) return [];

      return response
        .map((record) =>
          this.mapToRecommendedBook(record.book, record.score, 'personal_history'),
        )
        .filter((r): r is RecommendedBook => r !== null);
    } catch (error) {
      this.handleError(error, 'getPersonalRecommendations');
    }
  }

  async getPopularByCategory(
    category: string,
    limit: number,
  ): Promise<RecommendedBook[]> {
    try {
      const [response] = await this.db.query<PopularResult[]>(
        `SELECT out as book, count() as frequency
        FROM added_to_list
        WHERE reading_list.category = $category
        GROUP BY book
        ORDER BY frequency DESC
        LIMIT $limit
        FETCH book`,
        { category, limit },
      );

      if (!Array.isArray(response) || !response.length) return [];

      return response
        .map((record) =>
          this.mapToRecommendedBook(
            record.book,
            record.frequency,
            'popular_in_category',
          ),
        )
        .filter((r): r is RecommendedBook => r !== null);
    } catch (error) {
      this.handleError(error, 'getPopularByCategory');
    }
  }

  async getTrending(limit: number, days: number): Promise<RecommendedBook[]> {
    try {
      const [response] = await this.db.query<TrendingResult[]>(
        `SELECT out as book, count() as activity,
          math::mean(rating) as avg_rating
        FROM reviewed
        WHERE created_at > time::now() - ${days}d
        GROUP BY book
        ORDER BY activity DESC, avg_rating DESC
        LIMIT $limit
        FETCH book`,
        { limit },
      );

      if (!Array.isArray(response) || !response.length) return [];

      return response
        .map((record) => {
          const book = this.mapToRecommendedBook(
            record.book,
            record.activity,
            'trending',
          );
          if (book) {
            book.avgRating =
              Math.round((record.avg_rating ?? 0) * 100) / 100;
          }
          return book;
        })
        .filter((r): r is RecommendedBook => r !== null);
    } catch (error) {
      this.handleError(error, 'getTrending');
    }
  }

  async getSimilarBooks(
    userId: string,
    bookId: string,
    limit: number,
  ): Promise<RecommendedBook[]> {
    try {
      const userRecordId = toRecordId('user', userId);
      const bookRecordId = toRecordId('book', bookId);

      const [response] = await this.db.query<CollaborativeResult[]>(
        `SELECT out as book, count() as score
        FROM reviewed
        WHERE in IN (
          SELECT VALUE in FROM reviewed WHERE out = $book AND rating >= 4
        )
        AND out != $book
        AND out NOT IN (SELECT VALUE out FROM reviewed WHERE in = $user)
        AND rating >= 4
        GROUP BY book
        ORDER BY score DESC
        LIMIT $limit
        FETCH book`,
        { user: userRecordId, book: bookRecordId, limit },
      );

      if (!Array.isArray(response) || !response.length) return [];

      return response
        .map((record) =>
          this.mapToRecommendedBook(
            record.book,
            record.score,
            'similar_to_book',
          ),
        )
        .filter((r): r is RecommendedBook => r !== null);
    } catch (error) {
      this.handleError(error, 'getSimilarBooks');
    }
  }

  private mapToRecommendedBook(
    book: RecordId | string | BookRecord,
    score: number,
    reason: RecommendationReason,
  ): RecommendedBook | null {
    if (!book) return null;

    // After FETCH, book should be a full record object
    if (typeof book === 'object' && 'title' in book) {
      return {
        bookId: fromRecordId(book.id),
        title: book.title,
        isbn: book.isbn,
        score,
        reason,
      };
    }

    // Fallback if FETCH didn't resolve the book
    return {
      bookId: typeof book === 'string' ? book : fromRecordId(book),
      title: '',
      isbn: '',
      score,
      reason,
    };
  }

  private handleError(error: unknown, methodName: string): never {
    logger.error(`Error ${methodName}:`, error);
    if (error instanceof ResponseError) {
      throw new DatabaseErrorException({
        description: error.message,
        cause: error.stack,
      });
    }
    throw new DatabaseErrorException(error);
  }
}
