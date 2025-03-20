import { inject, injectable } from 'inversify';
import Surreal, { RecordId, ResponseError } from 'surrealdb';

import { Author } from '@/modules/authors/domain/entities';
import { AuthorRepository } from '@/modules/authors/domain/repositories';
import { AuthorFilters } from '@/modules/authors/infrastructure/types/author.filters';

import { logger } from 'core/config/logger';
import { TYPES } from '@/core/common/constants/types';
import { SurrealRecordIdMapper } from '@/modules/shared/mappers';
import { DatabaseErrorException } from '@/modules/shared/exceptions';

interface AuthorRecord {
  id: RecordId | string;
  first_name: string;
  last_name: string;
  nationality: string;
  biography: string;
  awards: string[];
  genres: string[];
  notable_works: string[];
  website: string;
  social_links: Partial<{
    facebook: string;
    twitter: string;
    instagram: string;
  }>;
  birth_date: string | Date;
  date_of_death: string | Date;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: unknown;
}

@injectable()
export class SurrealAuthorRepository implements AuthorRepository {
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getAuthorById(id: string): Promise<Author | null> {
    try {
      const authorRecordId = SurrealRecordIdMapper.toRecordId('author', id);

      const authorRecord = await this.db.select<AuthorRecord>(authorRecordId);

      if (!authorRecord) return null;

      return this.mapToAuthor(authorRecord);
    } catch (error) {
      this.handleError(error, 'getAuthorById');
    }
  }

  async getAllAuthors(): Promise<Author[]> {
    try {
      const response = await this.db.select<AuthorRecord>('author');

      if (!response?.length) return [];

      return response.map((author: AuthorRecord) => this.mapToAuthor(author));
    } catch (error) {
      this.handleError(error, 'getAllAuthors');
    }
  }

  criteriaToQuery(filters: AuthorFilters) {
    const params: {
      is_active?: boolean;
      name?: string;
      nationality?: string;
      skip?: number;
      limit?: number;
      orderBy?: string;
      sortBy?: string;
    } = {};
    const conditions: string[] = [];
    let query = 'SELECT * FROM author';

    if (filters.isActive !== undefined) {
      conditions.push('is_active = $is_active');
      params.is_active = filters.isActive;
    }

    if (filters.name) {
      conditions.push('string::contains(string::lowercase(name), string::lowercase($name))');
      params.name = filters.name;
    }

    if (filters.nationality) {
      conditions.push('string::contains(string::lowercase(nationality), string::lowercase($nationality))');
      params.nationality = filters.nationality;
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

  async getAuthorsByFilters(filters: AuthorFilters): Promise<Author[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<AuthorRecord[]>(query, params);

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((author: AuthorRecord) => this.mapToAuthor(author));
    } catch (error) {
      this.handleError(error, 'getAuthorsByFilters');
    }
  }

  async createAuthor(Author: Author): Promise<Author | null> {
    try {
      const properties = Author.propertiesToDatabase();
      const authorRecordId = SurrealRecordIdMapper.toRecordId('author', properties.id!);

      const newAuthorRecord = await this.db.create(authorRecordId, properties);

      if (!newAuthorRecord) return null;

      return this.mapToAuthor(newAuthorRecord);
    } catch (error) {
      this.handleError(error, 'createAuthor');
    }
  }

  async updateAuthor(id: string, author: Author): Promise<Author | null> {
    try {
      const authorRecordId = SurrealRecordIdMapper.toRecordId('author', id);
      const properties = author.properties();

      const payload: Partial<AuthorRecord> = {
        first_name: properties.firstName,
        last_name: properties.lastName,
        nationality: properties.nationality,
        biography: properties.biography,
        awards: properties.awards,
        genres: properties.genres,
        notable_works: properties.notableWorks,
        website: properties.website,
        social_links: properties.socialLinks,
        birth_date: properties.birthDate,
        date_of_death: properties.dateOfDeath,
        is_active: properties.isActive,
        created_at: properties.createdAt,
        updated_at: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const updatedAuthorRecord = await this.db.update(authorRecordId, payload);

      if (!updatedAuthorRecord) return null;

      return this.mapToAuthor(updatedAuthorRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updateAuthor');
    }
  }

  async deleteAuthor(id: string): Promise<boolean> {
    try {
      const authorRecordId = SurrealRecordIdMapper.toRecordId('author', id);
      const removedAuthorRecord = await this.db.delete<AuthorRecord>(authorRecordId);

      if (!removedAuthorRecord) return false;

      return removedAuthorRecord.id ? true : false;
    } catch (error: unknown) {
      this.handleError(error, 'deleteAuthor');
    }
  }

  async toggleAuthorStatus(id: string): Promise<boolean> {
    try {
      const authorRecordId = SurrealRecordIdMapper.toRecordId('author', id);

      const currentAuthor = await this.db.select<AuthorRecord>(authorRecordId);

      if (!currentAuthor) return false;

      const updatedAuthorRecord = await this.db.update(authorRecordId, {
        is_active: !currentAuthor.is_active,
        updated_at: new Date(),
      });

      if (!updatedAuthorRecord) return false;

      return true;
    } catch (error: unknown) {
      this.handleError(error, 'toggleAuthorStatus');
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

  private mapToAuthor(record: any): Author {
    return new Author({
      id: SurrealRecordIdMapper.fromRecordId(record.id),
      firstName: record.first_name,
      lastName: record.last_name,
      nationality: record.nationality,
      biography: record.biography,
      awards: record.awards,
      genres: record.genres,
      notableWorks: record.notable_works,
      website: record.website,
      socialLinks: record.social_links,
      birthDate: new Date(record.birth_date),
      dateOfDeath: new Date(record.date_of_death),
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }
}
