import { Country } from '@/modules/countries/domain/entities';
import { CountryFilters } from '@/modules/countries/infrastructure/types/country.filters';

export interface CountryRepository {
  getCountryById(id: string): Promise<Country | null>;
  getCountryByIsoCode(isoCode: string): Promise<Country | null>;
  getAllCountries(): Promise<Country[]>;
  getCountriesByFilters(filters: CountryFilters): Promise<Country[]>;
  createCountry(country: Country): Promise<Country | null>;
  updateCountry(id: string, country: Country): Promise<Country | null>;
  deleteCountry(id: string): Promise<boolean>;
  toggleCountryStatus(id: string): Promise<boolean>;
}
