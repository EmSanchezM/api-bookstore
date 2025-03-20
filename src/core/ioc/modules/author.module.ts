import { ContainerModule } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import { SurrealAuthorRepository } from '@/modules/authors/infrastructure/repositories/surreal-author.repository';
import {
  CreateAuthorUseCase,
  FindAllAuthorsUseCase,
  FindByFiltersAuthorUseCase,
  FindByIdAuthorUseCase,
  RemoveAuthorUseCase,
  UpdateAuthorUseCase,
} from '@/modules/authors/application/use-cases';

export const authorModule = new ContainerModule((bind) => {
  bind(TYPES.AuthorRepository).to(SurrealAuthorRepository);
  bind(TYPES.CreateAuthorUseCase).to(CreateAuthorUseCase);
  bind(TYPES.UpdateAuthorUseCase).to(UpdateAuthorUseCase);
  bind(TYPES.FindAllAuthorsUseCase).to(FindAllAuthorsUseCase);
  bind(TYPES.FindByFiltersAuthorUseCase).to(FindByFiltersAuthorUseCase);
  bind(TYPES.FindByIdAuthorUseCase).to(FindByIdAuthorUseCase);
  bind(TYPES.RemoveAuthorUseCase).to(RemoveAuthorUseCase);
});
