import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type { Surreal } from 'surrealdb';
import { type RecordId, ResponseError, Table } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { Language } from '@/modules/languages/domain/entities';
import type { LanguageRepository } from '@/modules/languages/domain/repositories';
import type { LanguageFilters } from '@/modules/languages/infrastructure/types/language.filters';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';

interface LanguageRecord {
  id: RecordId | string;
  name: string;
  iso_code: string;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: unknown;
}

@injectable()
export class SurrealLanguageRepository implements LanguageRepository {
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getLanguageById(id: string): Promise<Language | null> {
    try {
      const languageRecordId = toRecordId('language', id);

      const LanguageRecord =
        await this.db.select<LanguageRecord>(languageRecordId);

      if (!LanguageRecord) return null;

      return this.mapToLanguage(LanguageRecord);
    } catch (error) {
      this.handleError(error, 'getLanguageById');
    }
  }

  async getLanguageByIsoCode(isoCode: string): Promise<Language | null> {
    try {
      const [response] = await this.db.query<LanguageRecord[]>(
        'SELECT * FROM language WHERE iso_code = $iso_code LIMIT 1',
        { iso_code: isoCode },
      );

      if (!response?.length) return null;

      if (!response[0]) return null;

      const languageRecord = response[0] as Record<string, unknown>;

      return this.mapToLanguage(languageRecord);
    } catch (error) {
      this.handleError(error, 'getLanguageByIsoCode');
    }
  }

  async getAllLanguages(): Promise<Language[]> {
    try {
      const response = await this.db.select<LanguageRecord>(
        new Table('language'),
      );

      if (!response?.length) return [];

      return response.map((language) =>
        this.mapToLanguage(language as unknown as Record<string, unknown>),
      );
    } catch (error) {
      this.handleError(error, 'getAllLanguages');
    }
  }

  criteriaToQuery(filters: LanguageFilters) {
    const params: {
      is_active?: boolean;
      name?: string;
      iso_code?: string;
      skip?: number;
      limit?: number;
      orderBy?: string;
      sortBy?: string;
    } = {};
    const conditions: string[] = [];
    let query = 'SELECT * FROM language';

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

    if (filters.isoCode) {
      conditions.push('iso_code = $iso_code');
      params.iso_code = filters.isoCode;
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

  async getLanguagesByFilters(filters: LanguageFilters): Promise<Language[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<LanguageRecord[]>(query, params);

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((language) =>
        this.mapToLanguage(language as unknown as Record<string, unknown>),
      );
    } catch (error) {
      this.handleError(error, 'getAllLanguages');
    }
  }

  async createLanguage(Language: Language): Promise<Language | null> {
    try {
      const properties = Language.propertiesToDatabase();
      const languageRecordId = toRecordId('language', properties.id as string);

      const newLanguageRecord = await this.db
        .create(languageRecordId)
        .content(properties);

      if (!newLanguageRecord) return null;

      return this.mapToLanguage(newLanguageRecord);
    } catch (error) {
      this.handleError(error, 'createLanguage');
    }
  }

  async updateLanguage(
    id: string,
    Language: Language,
  ): Promise<Language | null> {
    try {
      const languageRecordId = toRecordId('language', id);
      const properties = Language.properties();

      const payload: Partial<LanguageRecord> = {
        name: properties.name,
        iso_code: properties.isoCode,
        is_active: properties.isActive,
        created_at: properties.createdAt,
        updated_at: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const updatedLanguageRecord = await this.db
        .update(languageRecordId)
        .merge(payload);

      if (!updatedLanguageRecord) return null;

      return this.mapToLanguage(updatedLanguageRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updateLanguage');
    }
  }

  async deleteLanguage(id: string): Promise<boolean> {
    try {
      const languageRecordId = toRecordId('language', id);
      const removedLanguageRecord =
        await this.db.delete<LanguageRecord>(languageRecordId);

      if (!removedLanguageRecord) return false;

      return !!removedLanguageRecord.id;
    } catch (error: unknown) {
      this.handleError(error, 'deleteLanguage');
    }
  }

  async toggleLanguageStatus(id: string): Promise<boolean> {
    try {
      const languageRecordId = toRecordId('Language', id);

      const currentLanguage =
        await this.db.select<LanguageRecord>(languageRecordId);

      if (!currentLanguage) return false;

      const updatedLanguageRecord = await this.db
        .update(languageRecordId)
        .merge({
          is_active: !currentLanguage.is_active,
          updated_at: new Date(),
        });

      if (!updatedLanguageRecord) return false;

      return true;
    } catch (error: unknown) {
      this.handleError(error, 'toggleLanguageStatus');
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

  private mapToLanguage(record: Record<string, unknown>): Language {
    const r = record as LanguageRecord;
    return new Language({
      id: fromRecordId(r.id),
      name: r.name,
      isoCode: r.iso_code,
      isActive: r.is_active,
      createdAt: new Date(r.created_at as string),
      updatedAt: new Date(r.updated_at as string),
    });
  }
}
