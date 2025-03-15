import { inject, injectable } from 'inversify';
import Surreal, { RecordId, ResponseError } from 'surrealdb';

import { Country } from '@/modules/countries/domain/entities';
import { CountryRepository } from '@/modules/countries/domain/repositories';
import { SurrealRecordIdMapper } from '@/modules/countries/infrastructure/mappers';

import { SurrealRecordId } from '@/modules/shared/types';

import { logger } from 'core/config/logger';
import { TYPES } from '@/core/common/constants/types';
import { DatabaseErrorException } from '@/modules/shared/exceptions';

interface CountryRecord {
  id: SurrealRecordId | RecordId | string;
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
      const countryRecordId = SurrealRecordIdMapper.toRecordId('country', id);

      const countryRecord = await this.db.select<CountryRecord>(countryRecordId);

      if (!countryRecord) return null;

      return this.mapToCountry(countryRecord);
    } catch (error) {
      this.handleError(error, 'getCountryById');
    }
  }

  async getCountryByIsoCode(isoCode: string): Promise<Country | null> {
    try {
      const [countryRecord] = await this.db.query<[CountryRecord[]]>(
        'SELECT * FROM country WHERE iso_code = $iso_code LIMIT 1',
        { iso_code: isoCode },
      );

      if (!countryRecord?.[0]) return null;

      return this.mapToCountry(countryRecord[0]);
    } catch (error) {
      this.handleError(error, 'getCountryByIsoCode');
    }
  }

  async getAllCountries(): Promise<Country[]> {
    try {
      const response = await this.db.select<CountryRecord>('country');

      if (!response?.length) return [];

      return response.map((country: any) => this.mapToCountry(country));
    } catch (error) {
      this.handleError(error, 'getAllCountries');
    }
  }

  async createCountry(country: Country): Promise<Country | null> {
    try {
      const properties = country.propertiesToDatabase();
      const countryRecordId = SurrealRecordIdMapper.toRecordId('country', properties.id!);

      const newCountryRecord = await this.db.create(countryRecordId, properties);

      if (!newCountryRecord) return null;

      return this.mapToCountry(newCountryRecord);
    } catch (error) {
      this.handleError(error, 'createCountry');
    }
  }

  async updateCountry(id: string, country: Country): Promise<Country | null> {
    try {
      const countryRecordId = SurrealRecordIdMapper.toRecordId('country', id);
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

      const updatedCountryRecord = await this.db.update(countryRecordId, payload);
      console.log(updatedCountryRecord);
      if (!updatedCountryRecord) return null;

      return this.mapToCountry(updatedCountryRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updateCountry');
    }
  }

  async deleteCountry(id: string): Promise<boolean> {
    try {
      const countryRecordId = SurrealRecordIdMapper.toRecordId('country', id);
      const removedCountryRecord = await this.db.delete<CountryRecord>(countryRecordId);

      if (!removedCountryRecord) return false;

      return removedCountryRecord.id ? true : false;
    } catch (error) {
      this.handleError(error, 'deleteCountry');
    }
  }

  async toggleCountryStatus(id: string): Promise<boolean> {
    try {
      const countryRecordId = SurrealRecordIdMapper.toRecordId('country', id);

      const currentCountry = await this.db.select<CountryRecord>(countryRecordId);

      if (!currentCountry) return false;

      const updatedCountryRecord = await this.db.update(countryRecordId, {
        is_active: !currentCountry.is_active,
        updated_at: new Date(),
      });

      if (!updatedCountryRecord) return false;

      return true;
    } catch (error) {
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

  private mapToCountry(record: any): Country {
    return new Country({
      id: SurrealRecordIdMapper.fromRecordId(record.id),
      name: record.name,
      isoCode: record.iso_code,
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }
}
