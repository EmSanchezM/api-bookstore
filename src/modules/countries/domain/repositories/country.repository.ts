import { Country } from '@/modules/countries/domain/entities';

export interface CountryRepository {
  getCountryById(id: string): Promise<Country | null>;
  getCountryByIsoCode(isoCode: string): Promise<Country | null>;
  getAllCountries(): Promise<Country[]>;
  createCountry(country: Country): Promise<Country | null>;
  updateCountry(id: string, country: Country): Promise<Country | null>;
  deleteCountry(id: string): Promise<boolean>;
  toggleCountryStatus(id: string): Promise<boolean>;
}
