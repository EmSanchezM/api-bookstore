import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { CountryRepository } from '@/modules/countries/domain/repositories';

@injectable()
export class FindAllCountriesUseCase {
  constructor(@inject(TYPES.CountryRepository) private countryRepositoty: CountryRepository) {}

  async execute() {
    const countries = await this.countryRepositoty.getAllCountries();

    if (!countries.length) return [];

    return countries;
  }
}
