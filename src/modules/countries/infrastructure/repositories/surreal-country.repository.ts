import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type { Surreal } from 'surrealdb';
import { type RecordId, ResponseError, Table } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { Country } from '@/modules/countries/domain/entities';
import type { CountryRepository } from '@/modules/countries/domain/repositories';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';
import type { CountryFilters } from '../types/country.filters';

interface CountryRecord {
  id: RecordId | string;
  name: string;
  iso_code: string;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: unknown;
}

@injectable()
export class SurrealCountryRepository implements CountryRepository {
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getCountryById(id: string): Promise<Country | null> {
    try {
      const countryRecordId = toRecordId('country', id);

      const countryRecord =
        await this.db.select<CountryRecord>(countryRecordId);

      if (!countryRecord) return null;

      return this.mapToCountry(countryRecord);
    } catch (error) {
      this.handleError(error, 'getCountryById');
    }
  }

  async getCountryByIsoCode(isoCode: string): Promise<Country | null> {
    try {
      const [response] = await this.db.query<CountryRecord[]>(
        'SELECT * FROM country WHERE iso_code = $iso_code LIMIT 1',
        { iso_code: isoCode },
      );

      if (!response?.length) return null;

      if (!response[0]) return null;

      const countryRecord = response[0] as Record<string, unknown>;

      return this.mapToCountry(countryRecord);
    } catch (error) {
      this.handleError(error, 'getCountryByIsoCode');
    }
  }

  async getAllCountries(): Promise<Country[]> {
    try {
      const response = await this.db.select<CountryRecord>(
        new Table('country'),
      );

      if (!response?.length) return [];

      return response.map((country) =>
        this.mapToCountry(country as unknown as Record<string, unknown>),
      );
    } catch (error) {
      this.handleError(error, 'getAllCountries');
    }
  }

  criteriaToQuery(filters: CountryFilters) {
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
    let query = 'SELECT * FROM country';

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

    const orderBy = (filters.orderBy ?? 'created_at').replace(
      /[A-Z]/g,
      (c) => `_${c.toLowerCase()}`,
    );
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

  async getCountriesByFilters(filters: CountryFilters): Promise<Country[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<CountryRecord[]>(query, params);

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((country) =>
        this.mapToCountry(country as unknown as Record<string, unknown>),
      );
    } catch (error) {
      this.handleError(error, 'getAllCountries');
    }
  }

  async createCountry(country: Country): Promise<Country | null> {
    try {
      const properties = country.propertiesToDatabase();
      const countryRecordId = toRecordId('country', properties.id as string);

      const newCountryRecord = await this.db
        .create(countryRecordId)
        .content(properties);

      if (!newCountryRecord) return null;

      return this.mapToCountry(newCountryRecord);
    } catch (error) {
      this.handleError(error, 'createCountry');
    }
  }

  async updateCountry(id: string, country: Country): Promise<Country | null> {
    try {
      const countryRecordId = toRecordId('country', id);
      const properties = country.properties();

      const payload: Partial<CountryRecord> = {
        name: properties.name,
        iso_code: properties.isoCode,
        is_active: properties.isActive,
        created_at: properties.createdAt,
        updated_at: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const updatedCountryRecord = await this.db
        .update(countryRecordId)
        .merge(payload);

      if (!updatedCountryRecord) return null;

      return this.mapToCountry(updatedCountryRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updateCountry');
    }
  }

  async deleteCountry(id: string): Promise<boolean> {
    try {
      const countryRecordId = toRecordId('country', id);
      const removedCountryRecord =
        await this.db.delete<CountryRecord>(countryRecordId);

      if (!removedCountryRecord) return false;

      return !!removedCountryRecord.id;
    } catch (error: unknown) {
      this.handleError(error, 'deleteCountry');
    }
  }

  async toggleCountryStatus(id: string): Promise<boolean> {
    try {
      const countryRecordId = toRecordId('country', id);

      const currentCountry =
        await this.db.select<CountryRecord>(countryRecordId);

      if (!currentCountry) return false;

      const updatedCountryRecord = await this.db.update(countryRecordId).merge({
        is_active: !currentCountry.is_active,
        updated_at: new Date(),
      });

      if (!updatedCountryRecord) return false;

      return true;
    } catch (error: unknown) {
      this.handleError(error, 'toggleCountryStatus');
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

  private mapToCountry(record: Record<string, unknown>): Country {
    const r = record as CountryRecord;
    return new Country({
      id: fromRecordId(r.id),
      name: r.name,
      isoCode: r.iso_code,
      isActive: r.is_active,
      createdAt: new Date(r.created_at as string),
      updatedAt: new Date(r.updated_at as string),
    });
  }
}
