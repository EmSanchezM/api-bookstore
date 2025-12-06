import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import type { CountryRepository } from '@/modules/countries/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';
@injectable()
export class FindByIsoCodeCountryUseCase {
  constructor(
    @inject(TYPES.CountryRepository)
    private countryRepositoty: CountryRepository,
  ) {}

  async execute(isoCode: string) {
    const country = await this.countryRepositoty.getCountryByIsoCode(isoCode);

    if (!country) throw new NotFoundException('Country not found');

    return country;
  }
}
