import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type {
  ListItemRepository,
  ReadingListRepository,
} from '@/modules/reading-lists/domain/repositories';
import {
  ForbiddenException,
  NotFoundException,
} from '@/modules/shared/exceptions';

@injectable()
export class GetListItemsUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
    @inject(TYPES.ListItemRepository)
    private listItemRepository: ListItemRepository,
  ) {}

  async execute(listId: string, requestUserId?: string) {
    const readingList =
      await this.readingListRepository.getReadingListById(listId);

    if (!readingList) throw new NotFoundException('Reading list not found');

    const props = readingList.properties();

    if (!props.isPublic && props.userId !== requestUserId)
      throw new ForbiddenException(
        'No tienes permiso para ver los libros de esta lista privada',
      );

    const items = await this.listItemRepository.getItemsByListId(listId);

    if (!items.length) return [];

    return items;
  }
}
