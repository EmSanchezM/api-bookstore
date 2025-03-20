import { ContainerModule } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import { SurrealLanguageRepository } from '@/modules/languages/infrastructure/repositories/surreal-language.repository';
import {
  CreateLanguageUseCase,
  FindAllLanguagesUseCase,
  FindByFiltersLanguageUseCase,
  FindByIdLanguageUseCase,
  FindByIsoCodeLanguageUseCase,
  RemoveLanguageUseCase,
  UpdateLanguageUseCase,
} from '@/modules/languages/application/use-cases';

export const languageModule = new ContainerModule((bind) => {
  bind(TYPES.LanguageRepository).to(SurrealLanguageRepository);
  bind(TYPES.CreateLanguageUseCase).to(CreateLanguageUseCase);
  bind(TYPES.FindAllLanguagesUseCase).to(FindAllLanguagesUseCase);
  bind(TYPES.FindByFiltersLanguageUseCase).to(FindByFiltersLanguageUseCase);
  bind(TYPES.FindByIdLanguageUseCase).to(FindByIdLanguageUseCase);
  bind(TYPES.FindByIsoCodeLanguageUseCase).to(FindByIsoCodeLanguageUseCase);
  bind(TYPES.UpdateLanguageUseCase).to(UpdateLanguageUseCase);
  bind(TYPES.RemoveLanguageUseCase).to(RemoveLanguageUseCase);
});
