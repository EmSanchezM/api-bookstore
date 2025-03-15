import { inject, injectable } from 'inversify';
import Surreal, { RecordId } from 'surrealdb';

import { Country, CountryUpdate } from '@/modules/countries/domain/entities';
import { CountryRepository } from '@/modules/countries/domain/repositories';
import { SurrealRecordIdMapper } from '@/modules/countries/infrastructure/mappers';

import { CountryRecordId, SurrealRecordId } from '@/modules/shared/types';

import { logger } from 'core/config/logger';
import { TYPES } from '@/core/common/constants/types';

interface CountryRecord {
  id: SurrealRecordId | RecordId | string;
  name: string;
  iso_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

@injectable()
export class SurrealCountryRepository implements CountryRepository {
  constructor(
    @inject(TYPES.DatabaseConnection) private readonly db: Surreal
  ) {}

  async getCountryById(id: string): Promise<Country | null> {
    const countryRecordId: CountryRecordId = `country:${id}`;
    try {
      const [result] = await this.db.select<CountryRecord>(countryRecordId);
      if (!result) return null;

      return this.mapToCountry(result);
    } catch (error) {
      logger.error('Error getting country by id:', error);
      return null;
    }
  }

  async getCountryByIsoCode(isoCode: string): Promise<Country | null> {
    try {
      const [result] = await this.db.query<[CountryRecord[]]>(
        'SELECT * FROM country WHERE iso_code = $iso_code LIMIT 1',
        { iso_code: isoCode },
      );

      if (!result?.[0]) return null;
      return this.mapToCountry(result[0]);
    } catch (error) {
      logger.error('Error getting country by ISO code:', error);
      return null;
    }
  }

  async getAllCountries(): Promise<Country[]> {
    try {
      const [result] = await this.db.query<[CountryRecord[]]>('SELECT * FROM country WHERE is_active = true');

      if (!result?.length) return [];
      return result.map((country) => this.mapToCountry(country));
    } catch (error) {
      logger.error('Error getting all countries:', error);
      return [];
    }
  }

  async createCountry(country: Country): Promise<Country | null> {
    try {
      const properties = country.properties();
      const countryRecordId = SurrealRecordIdMapper.toRecordId('country', properties.id!);
      const result = await this.db.create(countryRecordId, properties);

      if (!result) return null;
      return this.mapToCountry(result);
    } catch (error) {
      console.error('Error creating country:', error);
      return null;
    }
  }

  async updateCountry(id: string, country: Partial<CountryUpdate>): Promise<Country | null> {
    try {
      const countryRecordId = SurrealRecordIdMapper.toRecordId('country', id);
      const result = await this.db.update(countryRecordId, country);

      if (!result) return null;
      return this.mapToCountry(result);
    } catch (error) {
      logger.error('Error updating country:', error);
      return null;
    }
  }

  async deleteCountry(id: string): Promise<boolean> {
    try {
      const countryRecordId = SurrealRecordIdMapper.toRecordId('country', id);
      const result = await this.db.delete<CountryRecord>(countryRecordId);

      return Array.isArray(result) && result.length > 0;
    } catch (error) {
      logger.error('Error deleting country:', error);
      return false;
    }
  }

  private mapToCountry(record: any): Country {
    const id: string = SurrealRecordIdMapper.fromRecordId(record.id);

    return new Country({
      id,
      name: record.name,
      isoCode: record.iso_code,
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }
}
