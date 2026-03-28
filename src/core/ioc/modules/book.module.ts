import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  CreateBookUseCase,
  FindAllBooksUseCase,
  FindByFiltersBookUseCase,
  FindByIdBookUseCase,
  RemoveBookUseCase,
  ToggleStatusBookUseCase,
  UpdateBookUseCase,
} from '@/modules/books/application/use-cases';
import { SurrealBookRepository } from '@/modules/books/infrastructure/repositories/surreal-book.repository';

export const bookModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(TYPES.BookRepository).to(SurrealBookRepository);
    options.bind(TYPES.CreateBookUseCase).to(CreateBookUseCase);
    options.bind(TYPES.UpdateBookUseCase).to(UpdateBookUseCase);
    options.bind(TYPES.FindAllBooksUseCase).to(FindAllBooksUseCase);
    options.bind(TYPES.FindByFiltersBookUseCase).to(FindByFiltersBookUseCase);
    options.bind(TYPES.FindByIdBookUseCase).to(FindByIdBookUseCase);
    options.bind(TYPES.RemoveBookUseCase).to(RemoveBookUseCase);
    options.bind(TYPES.ToggleStatusBookUseCase).to(ToggleStatusBookUseCase);
  },
);
