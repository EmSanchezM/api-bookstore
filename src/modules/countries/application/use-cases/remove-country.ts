import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { CountryRepository } from '@/modules/countries/domain/repositories';
import { InternalServerErrorException, NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class RemoveCountryUseCase {
  constructor(@inject(TYPES.CountryRepository) private countryRepositoty: CountryRepository) {}

  async execute(id: string) {
    const country = await this.countryRepositoty.getCountryById(id);

    if (!country) throw new NotFoundException('Country not found');

    const deletedCountry = await this.countryRepositoty.deleteCountry(country.properties().id!);

    if (!deletedCountry) throw new InternalServerErrorException('Error deleting country');
    if (deletedCountry === null) throw new InternalServerErrorException('Error deleting country');

    return deletedCountry;
  }
}
