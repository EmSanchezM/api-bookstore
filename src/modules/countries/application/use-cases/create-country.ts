import { Country } from '@/modules/countries/domain/entities';
import { CountryRepository } from '@/modules/countries/domain/repositories';
import { CreateCountryDto } from '@/modules/countries/application/dtos';

export class CreateCountryUseCase {
  constructor(private countryRepositoty: CountryRepository) {}

  async execute(createCountryDto: CreateCountryDto) {
    const country = new Country({
      id: '1',
      isActive: true,
      ...createCountryDto,
    });

    const createdCountry = await this.countryRepositoty.createCountry(country);

    if (!createdCountry) throw new Error('Error creating country');
    if (createdCountry === null) throw new Error('Error creating country');

    return createdCountry;
  }
}
