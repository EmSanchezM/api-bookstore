import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  CreateLanguageUseCase,
  FindAllLanguagesUseCase,
  FindByFiltersLanguageUseCase,
  FindByIdLanguageUseCase,
  FindByIsoCodeLanguageUseCase,
  RemoveLanguageUseCase,
  UpdateLanguageUseCase,
} from '@/modules/languages/application/use-cases';
import { SurrealLanguageRepository } from '@/modules/languages/infrastructure/repositories/surreal-language.repository';

export const languageModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(TYPES.LanguageRepository).to(SurrealLanguageRepository);
    options.bind(TYPES.CreateLanguageUseCase).to(CreateLanguageUseCase);
    options.bind(TYPES.FindAllLanguagesUseCase).to(FindAllLanguagesUseCase);
    options
      .bind(TYPES.FindByFiltersLanguageUseCase)
      .to(FindByFiltersLanguageUseCase);
    options.bind(TYPES.FindByIdLanguageUseCase).to(FindByIdLanguageUseCase);
    options
      .bind(TYPES.FindByIsoCodeLanguageUseCase)
      .to(FindByIsoCodeLanguageUseCase);
    options.bind(TYPES.UpdateLanguageUseCase).to(UpdateLanguageUseCase);
    options.bind(TYPES.RemoveLanguageUseCase).to(RemoveLanguageUseCase);
  },
);
