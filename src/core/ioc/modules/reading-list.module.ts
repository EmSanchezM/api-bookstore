import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  AddBookToListUseCase,
  CreateReadingListUseCase,
  FindByFiltersReadingListUseCase,
  FindByIdReadingListUseCase,
  FindByUserIdReadingListUseCase,
  FindPublicReadingListsUseCase,
  GetListItemsUseCase,
  RemoveBookFromListUseCase,
  RemoveReadingListUseCase,
  UpdateListItemUseCase,
  UpdateReadingListUseCase,
} from '@/modules/reading-lists/application/use-cases';
import { SurrealListItemRepository } from '@/modules/reading-lists/infrastructure/repositories/surreal-list-item.repository';
import { SurrealReadingListRepository } from '@/modules/reading-lists/infrastructure/repositories/surreal-reading-list.repository';

export const readingListModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(TYPES.ReadingListRepository).to(SurrealReadingListRepository);
    options.bind(TYPES.ListItemRepository).to(SurrealListItemRepository);
    options
      .bind(TYPES.CreateReadingListUseCase)
      .to(CreateReadingListUseCase);
    options
      .bind(TYPES.FindByIdReadingListUseCase)
      .to(FindByIdReadingListUseCase);
    options
      .bind(TYPES.FindByUserIdReadingListUseCase)
      .to(FindByUserIdReadingListUseCase);
    options
      .bind(TYPES.FindPublicReadingListsUseCase)
      .to(FindPublicReadingListsUseCase);
    options
      .bind(TYPES.FindByFiltersReadingListUseCase)
      .to(FindByFiltersReadingListUseCase);
    options
      .bind(TYPES.UpdateReadingListUseCase)
      .to(UpdateReadingListUseCase);
    options
      .bind(TYPES.RemoveReadingListUseCase)
      .to(RemoveReadingListUseCase);
    options.bind(TYPES.AddBookToListUseCase).to(AddBookToListUseCase);
    options
      .bind(TYPES.RemoveBookFromListUseCase)
      .to(RemoveBookFromListUseCase);
    options.bind(TYPES.GetListItemsUseCase).to(GetListItemsUseCase);
    options.bind(TYPES.UpdateListItemUseCase).to(UpdateListItemUseCase);
  },
);
