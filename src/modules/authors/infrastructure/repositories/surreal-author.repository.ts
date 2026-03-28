import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type { Surreal } from 'surrealdb';
import { type RecordId, ResponseError, Table } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { Author } from '@/modules/authors/domain/entities';
import type { AuthorRepository } from '@/modules/authors/domain/repositories';
import type { AuthorFilters } from '@/modules/authors/infrastructure/types/author.filters';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';

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
      const authorRecordId = toRecordId('author', id);

      const authorRecord = await this.db.select<AuthorRecord>(authorRecordId);

      if (!authorRecord) return null;

      return this.mapToAuthor(authorRecord);
    } catch (error) {
      this.handleError(error, 'getAuthorById');
    }
  }

  async getAllAuthors(): Promise<Author[]> {
    try {
      const response = await this.db.select<AuthorRecord>(new Table('author'));

      if (!response?.length) return [];

      return response.map((author) =>
        this.mapToAuthor(author as unknown as Record<string, unknown>),
      );
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
      params.is_active = String(filters.isActive) === 'true';
    }

    if (filters.name) {
      conditions.push(
        'string::contains(string::lowercase(name), string::lowercase($name))',
      );
      params.name = filters.name;
    }

    if (filters.nationality) {
      conditions.push(
        'string::contains(string::lowercase(nationality), string::lowercase($nationality))',
      );
      params.nationality = filters.nationality;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const orderBy = filters.orderBy ?? 'created_at';
    const sortBy = filters.sortBy ?? 'desc';
    query += ` ORDER BY ${orderBy} ${sortBy}`;

    const skip = Number(filters.skip);
    const limit = Number(filters.limit);
    if (!isNaN(skip) && !isNaN(limit) && limit > 0) {
      query += ` LIMIT ${limit} START ${skip}`;
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

      return response.map((author) =>
        this.mapToAuthor(author as unknown as Record<string, unknown>),
      );
    } catch (error) {
      this.handleError(error, 'getAuthorsByFilters');
    }
  }

  async createAuthor(Author: Author): Promise<Author | null> {
    try {
      const properties = Author.propertiesToDatabase();
      const authorRecordId = toRecordId('author', properties.id as string);

      const newAuthorRecord = await this.db
        .create(authorRecordId)
        .content(properties);

      if (!newAuthorRecord) return null;

      return this.mapToAuthor(newAuthorRecord);
    } catch (error) {
      this.handleError(error, 'createAuthor');
    }
  }

  async updateAuthor(id: string, author: Author): Promise<Author | null> {
    try {
      const authorRecordId = toRecordId('author', id);
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

      const updatedAuthorRecord = await this.db
        .update(authorRecordId)
        .merge(payload);

      if (!updatedAuthorRecord) return null;

      return this.mapToAuthor(updatedAuthorRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updateAuthor');
    }
  }

  async deleteAuthor(id: string): Promise<boolean> {
    try {
      const authorRecordId = toRecordId('author', id);
      const removedAuthorRecord =
        await this.db.delete<AuthorRecord>(authorRecordId);

      if (!removedAuthorRecord) return false;

      return !!removedAuthorRecord.id;
    } catch (error: unknown) {
      this.handleError(error, 'deleteAuthor');
    }
  }

  async toggleAuthorStatus(id: string): Promise<boolean> {
    try {
      const authorRecordId = toRecordId('author', id);

      const currentAuthor = await this.db.select<AuthorRecord>(authorRecordId);

      if (!currentAuthor) return false;

      const updatedAuthorRecord = await this.db.update(authorRecordId).merge({
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

  private mapToAuthor(record: Record<string, unknown>): Author {
    const r = record as AuthorRecord;
    return new Author({
      id: fromRecordId(r.id),
      firstName: r.first_name,
      lastName: r.last_name,
      nationality: r.nationality,
      biography: r.biography,
      awards: r.awards,
      genres: r.genres,
      notableWorks: r.notable_works,
      website: r.website,
      socialLinks: r.social_links,
      birthDate: new Date(r.birth_date as string),
      dateOfDeath: new Date(r.date_of_death as string),
      isActive: r.is_active,
      createdAt: new Date(r.created_at as string),
      updatedAt: new Date(r.updated_at as string),
    });
  }
}
