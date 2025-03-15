import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';

import { CountryUpdate } from '@/modules/countries/domain/entities';
import { CountryRepository } from '@/modules/countries/domain/repositories';
import { UpdateCountryDto } from '@/modules/countries/application/dtos';

@injectable()
export class UpdateCountryUseCase {
  constructor(
    @inject(TYPES.CountryRepository) private countryRepositoty: CountryRepository,
  ) {}

  async execute(id: string, updateCountryDto: UpdateCountryDto) {
    const country = await this.countryRepositoty.getCountryById(id);

    if (!country) throw new Error('Error finding country');
    if (country === null) throw new Error('Error finding country');

    const payload: Partial<CountryUpdate> = {
      name: updateCountryDto.name,
      isoCode: updateCountryDto.isoCode,
    };

    const updatedCountry = await this.countryRepositoty.updateCountry(country.properties().id!, payload);

    if (!updatedCountry) throw new Error('Error updating country');
    if (updatedCountry === null) throw new Error('Error updating country');

    return updatedCountry;
  }
}
