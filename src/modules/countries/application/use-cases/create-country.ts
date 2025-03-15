import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';

import { Country } from '@/modules/countries/domain/entities';
import { CountryRepository } from '@/modules/countries/domain/repositories';
import { CreateCountryDto } from '@/modules/countries/application/dtos';
import { InternalServerErrorException } from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class CreateCountryUseCase {
  constructor(@inject(TYPES.CountryRepository) private countryRepositoty: CountryRepository) {}

  async execute(createCountryDto: CreateCountryDto) {
    const country = new Country({
      id: generateUUID(),
      isActive: true,
      ...createCountryDto,
    });
    console.log(country);

    const createdCountry = await this.countryRepositoty.createCountry(country);

    if (!createdCountry) throw new InternalServerErrorException('Error creating country');
    if (createdCountry === null) throw new InternalServerErrorException('Error creating country');

    return createdCountry;
  }
}
