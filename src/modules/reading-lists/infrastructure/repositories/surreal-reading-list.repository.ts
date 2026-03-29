import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type { Surreal } from 'surrealdb';
import { type RecordId, ResponseError, Table } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';
import { ReadingList } from '@/modules/reading-lists/domain/entities';
import type { ReadingListRepository } from '@/modules/reading-lists/domain/repositories';
import type { ReadingListFilters } from '@/modules/reading-lists/infrastructure/types/reading-list.filters';

interface ReadingListRecord {
  id: RecordId | string;
  user: RecordId | string;
  name: string;
  description: string | undefined;
  category: string;
  is_public: boolean;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: unknown;
}

@injectable()
export class SurrealReadingListRepository implements ReadingListRepository {
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getReadingListById(id: string): Promise<ReadingList | null> {
    try {
      const recordId = toRecordId('reading_list', id);

      const record = await this.db.select<ReadingListRecord>(recordId);

      if (!record) return null;

      return this.mapToReadingList(record);
    } catch (error) {
      this.handleError(error, 'getReadingListById');
    }
  }

  async getReadingListsByUserId(userId: string): Promise<ReadingList[]> {
    try {
      const userRecordId = toRecordId('user', userId);

      const [response] = await this.db.query<ReadingListRecord[]>(
        'SELECT * FROM reading_list WHERE user = $user AND is_active = true ORDER BY created_at DESC',
        { user: userRecordId },
      );

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((record: ReadingListRecord) =>
        this.mapToReadingList(record),
      );
    } catch (error) {
      this.handleError(error, 'getReadingListsByUserId');
    }
  }

  async getPublicReadingLists(): Promise<ReadingList[]> {
    try {
      const records = await this.db.select<ReadingListRecord>(
        new Table('reading_list'),
      );

      if (!records?.length) return [];

      return records
        .filter((r) => r.is_public && r.is_active)
        .map((record) =>
          this.mapToReadingList(record as unknown as Record<string, unknown>),
        );
    } catch (error) {
      this.handleError(error, 'getPublicReadingLists');
    }
  }

  criteriaToQuery(filters: ReadingListFilters) {
    const params: {
      user?: RecordId;
      category?: string;
      is_public?: boolean;
      is_active?: boolean;
      name?: string;
      skip?: number;
      limit?: number;
    } = {};
    const conditions: string[] = [];
    let query = 'SELECT * FROM reading_list';

    if (filters.userId) {
      conditions.push('user = $user');
      params.user = toRecordId('user', filters.userId);
    }

    if (filters.category) {
      conditions.push(
        'category IS NOT NONE AND string::contains(string::lowercase(category), string::lowercase($category))',
      );
      params.category = filters.category;
    }

    if (filters.isPublic !== undefined) {
      conditions.push('is_public = $is_public');
      params.is_public =
        typeof filters.isPublic === 'string'
          ? filters.isPublic === 'true'
          : filters.isPublic;
    }

    if (filters.isActive !== undefined) {
      conditions.push('is_active = $is_active');
      params.is_active =
        typeof filters.isActive === 'string'
          ? filters.isActive === 'true'
          : filters.isActive;
    }

    if (filters.name) {
      conditions.push(
        'name IS NOT NONE AND string::contains(string::lowercase(name), string::lowercase($name))',
      );
      params.name = filters.name;
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

    return {
      query,
      params,
    };
  }

  async getReadingListsByFilters(
    filters: ReadingListFilters,
  ): Promise<ReadingList[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<ReadingListRecord[]>(
        query,
        params,
      );

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((record: ReadingListRecord) =>
        this.mapToReadingList(record),
      );
    } catch (error) {
      this.handleError(error, 'getReadingListsByFilters');
    }
  }

  async createReadingList(list: ReadingList): Promise<ReadingList | null> {
    try {
      const properties = list.propertiesToDatabase();
      const recordId = toRecordId('reading_list', properties.id!);
      const userRecordId = toRecordId('user', properties.user);

      const newRecord = await this.db
        .create(recordId)
        .content({ ...properties, user: userRecordId });

      if (!newRecord) return null;

      return this.mapToReadingList(newRecord);
    } catch (error) {
      this.handleError(error, 'createReadingList');
    }
  }

  async updateReadingList(
    id: string,
    list: ReadingList,
  ): Promise<ReadingList | null> {
    try {
      const recordId = toRecordId('reading_list', id);
      const properties = list.properties();

      const payload: Partial<ReadingListRecord> = {
        name: properties.name,
        description: properties.description,
        category: properties.category,
        is_public: properties.isPublic,
        is_active: properties.isActive,
        updated_at: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const updatedRecord = await this.db.update(recordId).merge(payload);

      if (!updatedRecord) return null;

      return this.mapToReadingList(updatedRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updateReadingList');
    }
  }

  async deleteReadingList(id: string): Promise<boolean> {
    try {
      const recordId = toRecordId('reading_list', id);
      const removedRecord =
        await this.db.delete<ReadingListRecord>(recordId);

      if (!removedRecord) return false;

      return !!removedRecord.id;
    } catch (error: unknown) {
      this.handleError(error, 'deleteReadingList');
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

  private mapToReadingList(record: any): ReadingList {
    return new ReadingList({
      id: fromRecordId(record.id),
      userId: fromRecordId(record.user),
      name: record.name,
      description: record.description,
      category: record.category,
      isPublic: record.is_public,
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }
}
