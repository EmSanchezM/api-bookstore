import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type { Surreal } from 'surrealdb';
import { type RecordId, ResponseError } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import {
  ConflictException,
  DatabaseErrorException,
} from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';
import { Review } from '@/modules/reviews/domain/entities';
import type { ReviewRepository } from '@/modules/reviews/domain/repositories';
import type { ReviewFilters } from '@/modules/reviews/infrastructure/types/review.filters';

interface ReviewRecord {
  id: RecordId | string;
  user: RecordId | string;
  book: RecordId | string;
  rating: number;
  title: string;
  body: string;
  parent: RecordId | string | null;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: unknown;
}

interface AverageRatingResult {
  average: number;
  count: number;
}

@injectable()
export class SurrealReviewRepository implements ReviewRepository {
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getReviewById(id: string): Promise<Review | null> {
    try {
      const recordId = toRecordId('review', id);
      const record = await this.db.select<ReviewRecord>(recordId);

      if (!record) return null;

      return this.mapToReview(record);
    } catch (error) {
      this.handleError(error, 'getReviewById');
    }
  }

  async getReviewByUserAndBook(
    userId: string,
    bookId: string,
  ): Promise<Review | null> {
    try {
      const userRecordId = toRecordId('user', userId);
      const bookRecordId = toRecordId('book', bookId);

      const [response] = await this.db.query<ReviewRecord[]>(
        'SELECT * FROM review WHERE user = $user AND book = $book AND is_active = true LIMIT 1',
        { user: userRecordId, book: bookRecordId },
      );

      if (!response?.length) return null;
      if (!Array.isArray(response)) return null;

      return this.mapToReview(response[0]);
    } catch (error) {
      this.handleError(error, 'getReviewByUserAndBook');
    }
  }

  async getReviewsByBookId(bookId: string): Promise<Review[]> {
    try {
      const bookRecordId = toRecordId('book', bookId);

      const [response] = await this.db.query<ReviewRecord[]>(
        'SELECT * FROM review WHERE book = $book AND parent IS NONE AND is_active = true ORDER BY created_at DESC',
        { book: bookRecordId },
      );

      if (!response?.length) return [];
      if (!Array.isArray(response)) return [];

      return response.map((record: ReviewRecord) => this.mapToReview(record));
    } catch (error) {
      this.handleError(error, 'getReviewsByBookId');
    }
  }

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    try {
      const userRecordId = toRecordId('user', userId);

      const [response] = await this.db.query<ReviewRecord[]>(
        'SELECT * FROM review WHERE user = $user AND is_active = true ORDER BY created_at DESC',
        { user: userRecordId },
      );

      if (!response?.length) return [];
      if (!Array.isArray(response)) return [];

      return response.map((record: ReviewRecord) => this.mapToReview(record));
    } catch (error) {
      this.handleError(error, 'getReviewsByUserId');
    }
  }

  async getRepliesByReviewId(reviewId: string): Promise<Review[]> {
    try {
      const reviewRecordId = toRecordId('review', reviewId);

      const [response] = await this.db.query<ReviewRecord[]>(
        'SELECT * FROM review WHERE parent = $parent AND is_active = true ORDER BY created_at ASC',
        { parent: reviewRecordId },
      );

      if (!response?.length) return [];
      if (!Array.isArray(response)) return [];

      return response.map((record: ReviewRecord) => this.mapToReview(record));
    } catch (error) {
      this.handleError(error, 'getRepliesByReviewId');
    }
  }

  criteriaToQuery(filters: ReviewFilters) {
    const params: {
      user?: RecordId;
      book?: RecordId;
      rating?: number;
      is_active?: boolean;
      skip?: number;
      limit?: number;
    } = {};
    const conditions: string[] = [];
    let query = 'SELECT * FROM review';

    if (filters.userId) {
      conditions.push('user = $user');
      params.user = toRecordId('user', filters.userId);
    }

    if (filters.bookId) {
      conditions.push('book = $book');
      params.book = toRecordId('book', filters.bookId);
    }

    if (filters.rating) {
      conditions.push('rating = $rating');
      params.rating = Number(filters.rating);
    }

    if (filters.isActive !== undefined) {
      conditions.push('is_active = $is_active');
      params.is_active =
        typeof filters.isActive === 'string'
          ? filters.isActive === 'true'
          : filters.isActive;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const orderBy = (filters.orderBy ?? 'created_at').replace(
      /[A-Z]/g,
      (c) => `_${c.toLowerCase()}`,
    );
    const sortBy = filters.sortBy ?? 'desc';
    query += ` ORDER BY ${orderBy} ${sortBy}`;

    if (filters.limit !== undefined) {
      const limit = Number(filters.limit);
      const skip = Number(filters.skip ?? 0);
      query += ` LIMIT ${limit} START ${skip}`;
    }

    return { query, params };
  }

  async getReviewsByFilters(filters: ReviewFilters): Promise<Review[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<ReviewRecord[]>(query, params);

      if (!response?.length) return [];
      if (!Array.isArray(response)) return [];

      return response.map((record: ReviewRecord) => this.mapToReview(record));
    } catch (error) {
      this.handleError(error, 'getReviewsByFilters');
    }
  }

  async createReview(review: Review): Promise<Review | null> {
    try {
      const properties = review.propertiesToDatabase();
      const recordId = toRecordId('review', properties.id!);
      const userRecordId = toRecordId('user', properties.user);
      const bookRecordId = toRecordId('book', properties.book);

      const content: Record<string, unknown> = {
        ...properties,
        user: userRecordId,
        book: bookRecordId,
      };

      if (properties.parent) {
        content.parent = toRecordId('review', properties.parent);
      } else {
        delete content.parent;
      }

      Object.keys(content).forEach((key) => {
        if (content[key] === undefined) delete content[key];
      });

      const newRecord = await this.db.create(recordId).content(content);

      if (!newRecord) return null;

      // Create the reviewed graph edge (only for top-level reviews, not replies)
      if (!properties.parent) {
        await this.db.query(
          'RELATE $user->reviewed->$book SET rating = $rating, review = $review, created_at = time::now()',
          {
            user: userRecordId,
            book: bookRecordId,
            rating: properties.rating,
            review: recordId,
          },
        );
      }

      return this.mapToReview(newRecord);
    } catch (error) {
      this.handleError(error, 'createReview');
    }
  }

  async updateReview(id: string, review: Review): Promise<Review | null> {
    try {
      const recordId = toRecordId('review', id);
      const properties = review.propertiesToDatabase();

      const payload: Partial<ReviewRecord> = {
        rating: properties.rating,
        title: properties.title,
        body: properties.body,
        is_active: properties.is_active,
        updated_at: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const updatedRecord = await this.db.update(recordId).merge(payload);

      if (!updatedRecord) return null;

      return this.mapToReview(updatedRecord);
    } catch (error) {
      this.handleError(error, 'updateReview');
    }
  }

  async deleteReview(id: string): Promise<boolean> {
    try {
      const recordId = toRecordId('review', id);

      // Soft delete: toggle is_active
      const updatedRecord = await this.db
        .update(recordId)
        .merge({ is_active: false, updated_at: new Date() });

      if (!updatedRecord) return false;

      // Remove the reviewed graph edge
      await this.db.query(
        'DELETE reviewed WHERE review = $review',
        { review: recordId },
      );

      return true;
    } catch (error) {
      this.handleError(error, 'deleteReview');
    }
  }

  async getAverageRatingByBookId(
    bookId: string,
  ): Promise<{ average: number; count: number }> {
    try {
      const bookRecordId = toRecordId('book', bookId);

      const [response] = await this.db.query<AverageRatingResult[]>(
        `SELECT
          math::mean(rating) AS average,
          count() AS count
        FROM review
        WHERE book = $book AND parent IS NONE AND is_active = true
        GROUP ALL`,
        { book: bookRecordId },
      );

      if (!Array.isArray(response) || !response.length) {
        return { average: 0, count: 0 };
      }

      const stats = response[0];
      return {
        average: Math.round((stats.average ?? 0) * 100) / 100,
        count: stats.count ?? 0,
      };
    } catch (error) {
      this.handleError(error, 'getAverageRatingByBookId');
    }
  }

  private handleError(error: unknown, methodName: string): never {
    logger.error(`Error ${methodName}:`, error);
    if (error instanceof ResponseError) {
      if (error.message.includes('Database index')) {
        throw new ConflictException(
          'Ya existe una review para este libro por este usuario',
        );
      }
      throw new DatabaseErrorException({
        description: error.message,
        cause: error.stack,
      });
    }
    throw new DatabaseErrorException(error);
  }

  private mapToReview(record: any): Review {
    return new Review({
      id: fromRecordId(record.id),
      userId: fromRecordId(record.user),
      bookId: fromRecordId(record.book),
      rating: record.rating,
      title: record.title,
      body: record.body,
      parentId: record.parent ? fromRecordId(record.parent) : null,
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }
}
