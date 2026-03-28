import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type { Surreal } from 'surrealdb';
import { type RecordId, ResponseError, Table } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { Publisher } from '@/modules/publishers/domain/entities';
import type { PublisherRepository } from '@/modules/publishers/domain/repositories';
import type { PublisherFilters } from '@/modules/publishers/infrastructure/types/publisher.filters';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';

interface PublisherRecord {
  id: RecordId | string;
  name: string;
  website: string;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: unknown;
}

@injectable()
export class SurrealPublisherRepository implements PublisherRepository {
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getPublisherById(id: string): Promise<Publisher | null> {
    try {
      const publisherRecordId = toRecordId('publisher', id);

      const publisherRecord =
        await this.db.select<PublisherRecord>(publisherRecordId);

      if (!publisherRecord) return null;

      return this.mapToPublisher(publisherRecord);
    } catch (error) {
      this.handleError(error, 'getPublisherById');
    }
  }

  async getAllPublishers(): Promise<Publisher[]> {
    try {
      const response = await this.db.select<PublisherRecord>(
        new Table('publisher'),
      );

      if (!response?.length) return [];

      return response.map((publisher) =>
        this.mapToPublisher(publisher as unknown as Record<string, unknown>),
      );
    } catch (error) {
      this.handleError(error, 'getAllLanguages');
    }
  }

  criteriaToQuery(filters: PublisherFilters) {
    const params: {
      is_active?: boolean;
      name?: string;
      skip?: number;
      limit?: number;
      orderBy?: string;
      sortBy?: string;
    } = {};
    const conditions: string[] = [];
    let query = 'SELECT * FROM language';

    if (filters.isActive !== undefined) {
      conditions.push('is_active = $is_active');
      params.is_active = filters.isActive;
    }

    if (filters.name) {
      conditions.push(
        'string::contains(string::lowercase(name), string::lowercase($name))',
      );
      params.name = filters.name;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const orderBy = filters.orderBy ?? 'created_at';
    const sortBy = filters.sortBy ?? 'desc';
    query += ` ORDER BY ${orderBy} ${sortBy}`;

    if (filters.skip && filters.limit) {
      query += ` LIMIT ${filters.limit} START ${filters.skip}`;
    }

    return {
      query,
      params,
    };
  }

  async getPublishersByFilters(
    filters: PublisherFilters,
  ): Promise<Publisher[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<PublisherRecord[]>(query, params);

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((publisher) =>
        this.mapToPublisher(publisher as unknown as Record<string, unknown>),
      );
    } catch (error) {
      this.handleError(error, 'getPublishersByFilters');
    }
  }

  async createPublisher(publisher: Publisher): Promise<Publisher | null> {
    try {
      const properties = publisher.propertiesToDatabase();
      const publisherRecordId = toRecordId(
        'publisher',
        properties.id as string,
      );

      const newPublisherRecord = await this.db
        .create(publisherRecordId)
        .content(properties);

      if (!newPublisherRecord) return null;

      return this.mapToPublisher(newPublisherRecord);
    } catch (error) {
      this.handleError(error, 'createPublisher');
    }
  }

  async updatePublisher(
    id: string,
    publisher: Publisher,
  ): Promise<Publisher | null> {
    try {
      const publisherRecordId = toRecordId('publisher', id);
      const properties = publisher.properties();

      const payload: Partial<PublisherRecord> = {
        name: properties.name,
        website: properties.website,
        is_active: properties.isActive,
        created_at: properties.createdAt,
        updated_at: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const updatedPublisherRecord = await this.db
        .update(publisherRecordId)
        .merge(payload);

      if (!updatedPublisherRecord) return null;

      return this.mapToPublisher(updatedPublisherRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updatePublisher');
    }
  }

  async deletePublisher(id: string): Promise<boolean> {
    try {
      const publisherRecordId = toRecordId('publisher', id);
      const removedPublisherRecord =
        await this.db.delete<PublisherRecord>(publisherRecordId);

      if (!removedPublisherRecord) return false;

      return !!removedPublisherRecord.id;
    } catch (error: unknown) {
      this.handleError(error, 'deletePublisher');
    }
  }

  async togglePublisherStatus(id: string): Promise<boolean> {
    try {
      const publisherRecordId = toRecordId('publisher', id);

      const currentPublisher =
        await this.db.select<PublisherRecord>(publisherRecordId);

      if (!currentPublisher) return false;

      const updatedPublisherRecord = await this.db
        .update(publisherRecordId)
        .merge({
          is_active: !currentPublisher.is_active,
          updated_at: new Date(),
        });

      if (!updatedPublisherRecord) return false;

      return true;
    } catch (error: unknown) {
      this.handleError(error, 'togglePublisherStatus');
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

  private mapToPublisher(record: Record<string, unknown>): Publisher {
    const r = record as PublisherRecord;
    return new Publisher({
      id: fromRecordId(r.id),
      name: r.name,
      website: r.website,
      isActive: r.is_active,
      createdAt: new Date(r.created_at as string),
      updatedAt: new Date(r.updated_at as string),
    });
  }
}
