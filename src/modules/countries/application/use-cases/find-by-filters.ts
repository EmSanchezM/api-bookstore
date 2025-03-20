import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';

import { CountryRepository } from '@/modules/countries/domain/repositories';
import { CountryFilters } from '@/modules/countries/infrastructure/types/country.filters';

@injectable()
export class FindByFiltersCountryUseCase {
  constructor(@inject(TYPES.CountryRepository) private countryRepositoty: CountryRepository) {}

  async execute(filters: CountryFilters) {
    const countries = await this.countryRepositoty.getCountriesByFilters(filters);

    if (!countries.length) return [];

    return countries;
  }
}
