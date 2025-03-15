import { CountryRepository } from '@/modules/countries/domain/repositories';

export class FindAllCountriesUseCase {
  constructor(private countryRepositoty: CountryRepository) {}

  async execute() {
    const countries = await this.countryRepositoty.getAllCountries();

    if (!countries.length) throw new Error('Error finding countries');

    return countries;
  }
}
