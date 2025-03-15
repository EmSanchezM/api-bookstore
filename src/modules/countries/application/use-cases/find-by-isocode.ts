import { TYPES } from '@/core/common/constants/types';
import { CountryRepository } from '@/modules/countries/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';
import { inject, injectable } from 'inversify';
@injectable()
export class FindByIsoCodeCountryUseCase {
  constructor(
    @inject(TYPES.CountryRepository) private countryRepositoty: CountryRepository,
  ) {}

  async execute(isoCode: string) {
    const country = await this.countryRepositoty.getCountryByIsoCode(isoCode);

    if (!country) throw new NotFoundException('Country not found');
    
    return country;
  }
}
