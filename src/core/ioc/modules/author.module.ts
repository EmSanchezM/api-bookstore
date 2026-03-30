import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  CreateAuthorUseCase,
  FindAllAuthorsUseCase,
  FindByFiltersAuthorUseCase,
  FindByIdAuthorUseCase,
  RemoveAuthorUseCase,
  UpdateAuthorUseCase,
} from '@/modules/authors/application/use-cases';
import { SurrealAuthorRepository } from '@/modules/authors/infrastructure/repositories/surreal-author.repository';

export const authorModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(TYPES.AuthorRepository).to(SurrealAuthorRepository);
    options.bind(TYPES.CreateAuthorUseCase).to(CreateAuthorUseCase);
    options.bind(TYPES.UpdateAuthorUseCase).to(UpdateAuthorUseCase);
    options.bind(TYPES.FindAllAuthorsUseCase).to(FindAllAuthorsUseCase);
    options
      .bind(TYPES.FindByFiltersAuthorUseCase)
      .to(FindByFiltersAuthorUseCase);
    options.bind(TYPES.FindByIdAuthorUseCase).to(FindByIdAuthorUseCase);
    options.bind(TYPES.RemoveAuthorUseCase).to(RemoveAuthorUseCase);
  },
);
