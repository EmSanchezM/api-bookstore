import { inject, injectable } from 'inversify';
import Surreal, { RecordId, ResponseError } from 'surrealdb';

import { Language } from '@/modules/languages/domain/entities';
import { LanguageRepository } from '@/modules/languages/domain/repositories';
import { LanguageFilters } from '@/modules/languages/infrastructure/types/language.filters';

import { logger } from 'core/config/logger';
import { TYPES } from '@/core/common/constants/types';
import { SurrealRecordIdMapper } from '@/modules/shared/mappers';
import { DatabaseErrorException } from '@/modules/shared/exceptions';

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
      const languageRecordId = SurrealRecordIdMapper.toRecordId('language', id);

      const LanguageRecord = await this.db.select<LanguageRecord>(languageRecordId);

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

      const languageRecord = response[0];

      return this.mapToLanguage(languageRecord);
    } catch (error) {
      this.handleError(error, 'getLanguageByIsoCode');
    }
  }

  async getAllLanguages(): Promise<Language[]> {
    try {
      const response = await this.db.select<LanguageRecord>('language');

      if (!response?.length) return [];

      return response.map((Language: any) => this.mapToLanguage(Language));
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
      params.is_active = filters.isActive;
    }

    if (filters.name) {
      conditions.push('string::contains(string::lowercase(name), string::lowercase($name))');
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

    if (filters.skip && filters.limit) {
      query += ` LIMIT ${filters.limit} START ${filters.skip}`;
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

      return response.map((Language: LanguageRecord) => this.mapToLanguage(Language));
    } catch (error) {
      this.handleError(error, 'getAllLanguages');
    }
  }

  async createLanguage(Language: Language): Promise<Language | null> {
    try {
      const properties = Language.propertiesToDatabase();
      const languageRecordId = SurrealRecordIdMapper.toRecordId('language', properties.id!);

      const newLanguageRecord = await this.db.create(languageRecordId, properties);

      if (!newLanguageRecord) return null;

      return this.mapToLanguage(newLanguageRecord);
    } catch (error) {
      this.handleError(error, 'createLanguage');
    }
  }

  async updateLanguage(id: string, Language: Language): Promise<Language | null> {
    try {
      const languageRecordId = SurrealRecordIdMapper.toRecordId('language', id);
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

      const updatedLanguageRecord = await this.db.update(languageRecordId, payload);

      if (!updatedLanguageRecord) return null;

      return this.mapToLanguage(updatedLanguageRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updateLanguage');
    }
  }

  async deleteLanguage(id: string): Promise<boolean> {
    try {
      const languageRecordId = SurrealRecordIdMapper.toRecordId('language', id);
      const removedLanguageRecord = await this.db.delete<LanguageRecord>(languageRecordId);

      if (!removedLanguageRecord) return false;

      return removedLanguageRecord.id ? true : false;
    } catch (error: unknown) {
      this.handleError(error, 'deleteLanguage');
    }
  }

  async toggleLanguageStatus(id: string): Promise<boolean> {
    try {
      const languageRecordId = SurrealRecordIdMapper.toRecordId('Language', id);

      const currentLanguage = await this.db.select<LanguageRecord>(languageRecordId);

      if (!currentLanguage) return false;

      const updatedLanguageRecord = await this.db.update(languageRecordId, {
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

  private mapToLanguage(record: any): Language {
    return new Language({
      id: SurrealRecordIdMapper.fromRecordId(record.id),
      name: record.name,
      isoCode: record.iso_code,
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }
}
