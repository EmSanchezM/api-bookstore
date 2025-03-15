import { CountryRepository } from '@/modules/countries/domain/repositories';

export class FindByIsoCodeCountryUseCase {
  constructor(private countryRepositoty: CountryRepository) {}

  async execute(isoCode: string) {
    const country = await this.countryRepositoty.getCountryByIsoCode(isoCode);

    if (!country) throw new Error('Error finding country');
    if (country === null) throw new Error('Error finding country');

    return country;
  }
}
