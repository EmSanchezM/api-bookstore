import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { CountryRepository } from '@/modules/countries/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class FindByIdCountryUseCase {
  constructor(
    @inject(TYPES.CountryRepository) private countryRepositoty: CountryRepository,
  ) {}

  async execute(id: string) {
    const country = await this.countryRepositoty.getCountryById(id);

    if (!country) throw new NotFoundException('Country not found');
    
    return country;
  }
}
