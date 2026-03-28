import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  CreateCountryUseCase,
  FindAllCountriesUseCase,
  FindByFiltersCountryUseCase,
  FindByIdCountryUseCase,
  FindByIsoCodeCountryUseCase,
  RemoveCountryUseCase,
  UpdateCountryUseCase,
} from '@/modules/countries/application/use-cases';
import { SurrealCountryRepository } from '@/modules/countries/infrastructure/repositories/surreal-country.repository';

export const countryModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(TYPES.CountryRepository).to(SurrealCountryRepository);
    options.bind(TYPES.CreateCountryUseCase).to(CreateCountryUseCase);
    options.bind(TYPES.FindAllCountriesUseCase).to(FindAllCountriesUseCase);
    options
      .bind(TYPES.FindByFiltersCountryUseCase)
      .to(FindByFiltersCountryUseCase);
    options.bind(TYPES.FindByIdCountryUseCase).to(FindByIdCountryUseCase);
    options
      .bind(TYPES.FindByIsoCodeCountryUseCase)
      .to(FindByIsoCodeCountryUseCase);
    options.bind(TYPES.UpdateCountryUseCase).to(UpdateCountryUseCase);
    options.bind(TYPES.RemoveCountryUseCase).to(RemoveCountryUseCase);
  },
);
