import { CountryRepository } from '@/modules/countries/domain/repositories';

export class FindByIdCountryUseCase {
  constructor(private countryRepositoty: CountryRepository) {}

  async execute(id: string) {
    const country = await this.countryRepositoty.getCountryById(id);

    if (!country) throw new Error('Error finding country');
    if (country === null) throw new Error('Error finding country');

    return country;
  }
}
