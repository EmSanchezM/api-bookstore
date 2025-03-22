import { ContainerModule } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import { SurrealBookRepository } from '@/modules/books/infrastructure/repositories/surreal-book.repository';
import {
  CreateBookUseCase,
  FindAllBooksUseCase,
  FindByFiltersBookUseCase,
  FindByIdBookUseCase,
  RemoveBookUseCase,
  UpdateBookUseCase,
} from '@/modules/books/application/use-cases';

export const bookModule = new ContainerModule((bind) => {
  bind(TYPES.BookRepository).to(SurrealBookRepository);
  bind(TYPES.CreateBookUseCase).to(CreateBookUseCase);
  bind(TYPES.UpdateBookUseCase).to(UpdateBookUseCase);
  bind(TYPES.FindAllBooksUseCase).to(FindAllBooksUseCase);
  bind(TYPES.FindByFiltersBookUseCase).to(FindByFiltersBookUseCase);
  bind(TYPES.FindByIdBookUseCase).to(FindByIdBookUseCase);
  bind(TYPES.RemoveBookUseCase).to(RemoveBookUseCase);
});
