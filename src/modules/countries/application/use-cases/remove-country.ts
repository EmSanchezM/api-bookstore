import { CountryRepository } from '@/modules/countries/domain/repositories';

export class RemoveCountryUseCase {
  constructor(private countryRepositoty: CountryRepository) {}

  async execute(id: string) {
    const country = await this.countryRepositoty.getCountryById(id);

    if (!country) throw new Error('Error finding country');
    if (country === null) throw new Error('Error finding country');

    const deletedCountry = await this.countryRepositoty.deleteCountry(country.properties().id!);

    if (!deletedCountry) throw new Error('Error deleting country');
    if (deletedCountry === null) throw new Error('Error deleting country');

    return deletedCountry;
  }
}
