import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';

import { CountryRepository } from '@/modules/countries/domain/repositories';
import { UpdateCountryDto } from '@/modules/countries/application/dtos';

import { DatabaseErrorException, NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class UpdateCountryUseCase {
  constructor(@inject(TYPES.CountryRepository) private countryRepositoty: CountryRepository) {}

  async execute(id: string, updateCountryDto: UpdateCountryDto) {
    const existingCountry = await this.countryRepositoty.getCountryById(id);

    if (!existingCountry) throw new NotFoundException('Country not found');

    existingCountry.update({
      ...updateCountryDto,
    });

    const updatedCountry = await this.countryRepositoty.updateCountry(
      existingCountry.properties().id!,
      existingCountry,
    );

    if (!updatedCountry) throw new DatabaseErrorException('Error updating country');

    return updatedCountry;
  }
}
