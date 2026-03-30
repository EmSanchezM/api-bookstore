import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { UpdateListItemDto } from '@/modules/reading-lists/application/dtos';
import type {
  ListItemRepository,
  ReadingListRepository,
} from '@/modules/reading-lists/domain/repositories';
import {
  DatabaseErrorException,
  ForbiddenException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { type UserRole, ROLES } from '@/modules/shared/security/interfaces';

@injectable()
export class UpdateListItemUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
    @inject(TYPES.ListItemRepository)
    private listItemRepository: ListItemRepository,
  ) {}

  async execute(
    listId: string,
    bookId: string,
    userId: string,
    updateListItemDto: UpdateListItemDto,
    role?: UserRole,
  ) {
    const readingList =
      await this.readingListRepository.getReadingListById(listId);

    if (!readingList) throw new NotFoundException('Reading list not found');

    if (role !== ROLES.ADMIN && readingList.properties().userId !== userId)
      throw new ForbiddenException(
        'No tienes permiso para actualizar esta lista',
      );

    let updatedItem = null;

    if (updateListItemDto.position !== undefined) {
      updatedItem = await this.listItemRepository.updateItemPosition(
        listId,
        bookId,
        updateListItemDto.position,
      );
    }

    if (updateListItemDto.notes !== undefined) {
      updatedItem = await this.listItemRepository.updateItemNotes(
        listId,
        bookId,
        updateListItemDto.notes,
      );
    }

    if (!updatedItem)
      throw new DatabaseErrorException('Error updating list item');

    return updatedItem;
  }
}
