import { Country, CountryUpdate } from '@/modules/countries/domain/entities';

export interface CountryRepository {
  getCountryById(id: string): Promise<Country | null>;
  getCountryByIsoCode(isoCode: string): Promise<Country | null>;
  getAllCountries(): Promise<Country[]>;
  createCountry(country: Country): Promise<Country | null>;
  updateCountry(id: string, country: Partial<CountryUpdate>): Promise<Country | null>;
  deleteCountry(id: string): Promise<boolean>;
}
