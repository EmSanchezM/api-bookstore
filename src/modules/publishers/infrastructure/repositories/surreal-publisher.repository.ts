import { inject, injectable } from 'inversify';
import Surreal, { RecordId, ResponseError } from 'surrealdb';

import { Publisher } from '@/modules/publishers/domain/entities';
import { PublisherRepository } from '@/modules/publishers/domain/repositories';
import { PublisherFilters } from '@/modules/publishers/infrastructure/types/publisher.filters';

import { logger } from 'core/config/logger';
import { TYPES } from '@/core/common/constants/types';
import { SurrealRecordIdMapper } from '@/modules/shared/mappers';
import { DatabaseErrorException } from '@/modules/shared/exceptions';

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
      const publisherRecordId = SurrealRecordIdMapper.toRecordId('publisher', id);

      const publisherRecord = await this.db.select<PublisherRecord>(publisherRecordId);

      if (!publisherRecord) return null;

      return this.mapToPublisher(publisherRecord);
    } catch (error) {
      this.handleError(error, 'getPublisherById');
    }
  }

  async getAllPublishers(): Promise<Publisher[]> {
    try {
      const response = await this.db.select<PublisherRecord>('publisher');

      if (!response?.length) return [];

      return response.map((Language: any) => this.mapToPublisher(Language));
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
      conditions.push('string::contains(string::lowercase(name), string::lowercase($name))');
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

  async getPublishersByFilters(filters: PublisherFilters): Promise<Publisher[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<PublisherRecord[]>(query, params);

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((publisher: PublisherRecord) => this.mapToPublisher(publisher));
    } catch (error) {
      this.handleError(error, 'getPublishersByFilters');
    }
  }

  async createPublisher(publisher: Publisher): Promise<Publisher | null> {
    try {
      const properties = publisher.propertiesToDatabase();
      const publisherRecordId = SurrealRecordIdMapper.toRecordId('publisher', properties.id!);

      const newPublisherRecord = await this.db.create(publisherRecordId, properties);

      if (!newPublisherRecord) return null;

      return this.mapToPublisher(newPublisherRecord);
    } catch (error) {
      this.handleError(error, 'createPublisher');
    }
  }

  async updatePublisher(id: string, publisher: Publisher): Promise<Publisher | null> {
    try {
      const publisherRecordId = SurrealRecordIdMapper.toRecordId('publisher', id);
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

      const updatedPublisherRecord = await this.db.update(publisherRecordId, payload);

      if (!updatedPublisherRecord) return null;

      return this.mapToPublisher(updatedPublisherRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updatePublisher');
    }
  }

  async deletePublisher(id: string): Promise<boolean> {
    try {
      const publisherRecordId = SurrealRecordIdMapper.toRecordId('publisher', id);
      const removedPublisherRecord = await this.db.delete<PublisherRecord>(publisherRecordId);

      if (!removedPublisherRecord) return false;

      return removedPublisherRecord.id ? true : false;
    } catch (error: unknown) {
      this.handleError(error, 'deletePublisher');
    }
  }

  async togglePublisherStatus(id: string): Promise<boolean> {
    try {
      const publisherRecordId = SurrealRecordIdMapper.toRecordId('publisher', id);

      const currentPublisher = await this.db.select<PublisherRecord>(publisherRecordId);

      if (!currentPublisher) return false;

      const updatedPublisherRecord = await this.db.update(publisherRecordId, {
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

  private mapToPublisher(record: any): Publisher {
    return new Publisher({
      id: SurrealRecordIdMapper.fromRecordId(record.id),
      name: record.name,
      website: record.website,
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }
}
