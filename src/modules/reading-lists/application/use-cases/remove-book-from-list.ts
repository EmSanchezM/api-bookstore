import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type {
  ListItemRepository,
  ReadingListRepository,
} from '@/modules/reading-lists/domain/repositories';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/modules/shared/exceptions';

@injectable()
export class RemoveBookFromListUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
    @inject(TYPES.ListItemRepository)
    private listItemRepository: ListItemRepository,
  ) {}

  async execute(listId: string, bookId: string, userId: string) {
    const readingList =
      await this.readingListRepository.getReadingListById(listId);

    if (!readingList) throw new NotFoundException('Reading list not found');

    if (readingList.properties().userId !== userId)
      throw new ForbiddenException(
        'No tienes permiso para quitar libros de esta lista',
      );

    const removed = await this.listItemRepository.removeBookFromList(
      listId,
      bookId,
    );

    if (!removed)
      throw new InternalServerErrorException(
        'Error removing book from reading list',
      );

    return removed;
  }
}
