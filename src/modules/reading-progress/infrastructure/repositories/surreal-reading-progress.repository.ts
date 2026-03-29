import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type { Surreal } from 'surrealdb';
import { type RecordId, ResponseError, Table } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';
import { ReadingProgress } from '@/modules/reading-progress/domain/entities';
import type { ReadingProgressRepository } from '@/modules/reading-progress/domain/repositories';
import type { ReadingProgressFilters } from '@/modules/reading-progress/infrastructure/types/reading-progress.filters';

interface ReadingProgressRecord {
  id: RecordId | string;
  user: RecordId | string;
  book: RecordId | string;
  status: string;
  current_page: number;
  total_pages: number;
  percentage: number;
  started_at: string | Date | null;
  finished_at: string | Date | null;
  last_read_at: string | Date;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: unknown;
}

interface UserStatsResult {
  total_books: number;
  finished: number;
  reading: number;
  want_to_read: number;
  abandoned: number;
}

@injectable()
export class SurrealReadingProgressRepository
  implements ReadingProgressRepository
{
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getProgressById(id: string): Promise<ReadingProgress | null> {
    try {
      const recordId = toRecordId('reading_progress', id);
      const record = await this.db.select<ReadingProgressRecord>(recordId);

      if (!record) return null;

      return this.mapToReadingProgress(record);
    } catch (error) {
      this.handleError(error, 'getProgressById');
    }
  }

  async getProgressByUserAndBook(
    userId: string,
    bookId: string,
  ): Promise<ReadingProgress | null> {
    try {
      const userRecordId = toRecordId('user', userId);
      const bookRecordId = toRecordId('book', bookId);

      const [response] = await this.db.query<ReadingProgressRecord[]>(
        'SELECT * FROM reading_progress WHERE user = $user AND book = $book AND is_active = true LIMIT 1',
        { user: userRecordId, book: bookRecordId },
      );

      if (!response?.length) return null;
      if (!Array.isArray(response)) return null;

      return this.mapToReadingProgress(response[0]);
    } catch (error) {
      this.handleError(error, 'getProgressByUserAndBook');
    }
  }

  async getProgressByUserId(userId: string): Promise<ReadingProgress[]> {
    try {
      const userRecordId = toRecordId('user', userId);

      const [response] = await this.db.query<ReadingProgressRecord[]>(
        'SELECT * FROM reading_progress WHERE user = $user AND is_active = true ORDER BY last_read_at DESC',
        { user: userRecordId },
      );

      if (!response?.length) return [];
      if (!Array.isArray(response)) return [];

      return response.map((record: ReadingProgressRecord) =>
        this.mapToReadingProgress(record),
      );
    } catch (error) {
      this.handleError(error, 'getProgressByUserId');
    }
  }

  criteriaToQuery(filters: ReadingProgressFilters) {
    const params: {
      user?: RecordId;
      book?: RecordId;
      status?: string;
      is_active?: boolean;
      skip?: number;
      limit?: number;
    } = {};
    const conditions: string[] = [];
    let query = 'SELECT * FROM reading_progress';

    if (filters.userId) {
      conditions.push('user = $user');
      params.user = toRecordId('user', filters.userId);
    }

    if (filters.bookId) {
      conditions.push('book = $book');
      params.book = toRecordId('book', filters.bookId);
    }

    if (filters.status) {
      conditions.push('status = $status');
      params.status = filters.status;
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

    const orderBy = (filters.orderBy ?? 'last_read_at').replace(
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

  async getProgressByFilters(
    filters: ReadingProgressFilters,
  ): Promise<ReadingProgress[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<ReadingProgressRecord[]>(
        query,
        params,
      );

      if (!response?.length) return [];
      if (!Array.isArray(response)) return [];

      return response.map((record: ReadingProgressRecord) =>
        this.mapToReadingProgress(record),
      );
    } catch (error) {
      this.handleError(error, 'getProgressByFilters');
    }
  }

  async createProgress(
    progress: ReadingProgress,
  ): Promise<ReadingProgress | null> {
    try {
      const properties = progress.propertiesToDatabase();
      const recordId = toRecordId('reading_progress', properties.id!);
      const userRecordId = toRecordId('user', properties.user);
      const bookRecordId = toRecordId('book', properties.book);

      const content: Record<string, unknown> = {
        ...properties,
        user: userRecordId,
        book: bookRecordId,
      };

      Object.keys(content).forEach((key) => {
        if (content[key] === undefined) delete content[key];
      });

      const newRecord = await this.db
        .create(recordId)
        .content(content);

      if (!newRecord) return null;

      return this.mapToReadingProgress(newRecord);
    } catch (error) {
      this.handleError(error, 'createProgress');
    }
  }

  async updateProgress(
    id: string,
    progress: ReadingProgress,
  ): Promise<ReadingProgress | null> {
    try {
      const recordId = toRecordId('reading_progress', id);
      const properties = progress.propertiesToDatabase();

      const payload: Partial<ReadingProgressRecord> = {
        status: properties.status,
        current_page: properties.current_page,
        total_pages: properties.total_pages,
        percentage: properties.percentage,
        started_at: properties.started_at,
        finished_at: properties.finished_at,
        last_read_at: new Date(),
        is_active: properties.is_active,
        updated_at: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const updatedRecord = await this.db.update(recordId).merge(payload);

      if (!updatedRecord) return null;

      return this.mapToReadingProgress(updatedRecord);
    } catch (error) {
      this.handleError(error, 'updateProgress');
    }
  }

  async deleteProgress(id: string): Promise<boolean> {
    try {
      const recordId = toRecordId('reading_progress', id);
      const removedRecord =
        await this.db.delete<ReadingProgressRecord>(recordId);

      if (!removedRecord) return false;

      return !!removedRecord.id;
    } catch (error) {
      this.handleError(error, 'deleteProgress');
    }
  }

  async getUserStats(userId: string): Promise<{
    totalBooks: number;
    finished: number;
    reading: number;
    wantToRead: number;
    abandoned: number;
  }> {
    try {
      const userRecordId = toRecordId('user', userId);

      const [response] = await this.db.query<UserStatsResult[]>(
        `SELECT
          count() AS total_books,
          count(status = 'finished' OR NULL) AS finished,
          count(status = 'reading' OR NULL) AS reading,
          count(status = 'want_to_read' OR NULL) AS want_to_read,
          count(status = 'abandoned' OR NULL) AS abandoned
        FROM reading_progress
        WHERE user = $user AND is_active = true
        GROUP ALL`,
        { user: userRecordId },
      );

      if (!Array.isArray(response) || !response.length) {
        return {
          totalBooks: 0,
          finished: 0,
          reading: 0,
          wantToRead: 0,
          abandoned: 0,
        };
      }

      const stats = response[0];
      return {
        totalBooks: stats.total_books ?? 0,
        finished: stats.finished ?? 0,
        reading: stats.reading ?? 0,
        wantToRead: stats.want_to_read ?? 0,
        abandoned: stats.abandoned ?? 0,
      };
    } catch (error) {
      this.handleError(error, 'getUserStats');
    }
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

  private mapToReadingProgress(record: any): ReadingProgress {
    return new ReadingProgress({
      id: fromRecordId(record.id),
      userId: fromRecordId(record.user),
      bookId: fromRecordId(record.book),
      status: record.status,
      currentPage: record.current_page,
      totalPages: record.total_pages,
      percentage: record.percentage,
      startedAt: record.started_at ? new Date(record.started_at) : null,
      finishedAt: record.finished_at ? new Date(record.finished_at) : null,
      lastReadAt: new Date(record.last_read_at),
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }
}
