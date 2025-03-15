import { ContainerModule } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import { SurrealCountryRepository } from '@/modules/countries/infrastructure/repositories/surreal-country.repository';
import {
  CreateCountryUseCase,
  FindAllCountriesUseCase,
  FindByIdCountryUseCase,
  FindByIsoCodeCountryUseCase,
  RemoveCountryUseCase,
  UpdateCountryUseCase,
} from '@/modules/countries/application/use-cases';

export const countryModule = new ContainerModule((bind) => {
  bind(TYPES.CountryRepository).to(SurrealCountryRepository);
  bind(TYPES.CreateCountryUseCase).to(CreateCountryUseCase);
  bind(TYPES.FindAllCountriesUseCase).to(FindAllCountriesUseCase);
  bind(TYPES.FindByIdCountryUseCase).to(FindByIdCountryUseCase);
  bind(TYPES.FindByIsoCodeCountryUseCase).to(FindByIsoCodeCountryUseCase);
  bind(TYPES.UpdateCountryUseCase).to(UpdateCountryUseCase);
  bind(TYPES.RemoveCountryUseCase).to(RemoveCountryUseCase);
});
