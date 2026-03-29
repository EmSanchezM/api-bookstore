import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { AddBookToListDto } from '@/modules/reading-lists/application/dtos';
import { ListItem } from '@/modules/reading-lists/domain/entities';
import type {
  ListItemRepository,
  ReadingListRepository,
} from '@/modules/reading-lists/domain/repositories';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class AddBookToListUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
    @inject(TYPES.ListItemRepository)
    private listItemRepository: ListItemRepository,
  ) {}

  async execute(
    listId: string,
    userId: string,
    addBookToListDto: AddBookToListDto,
  ) {
    const readingList =
      await this.readingListRepository.getReadingListById(listId);

    if (!readingList) throw new NotFoundException('Reading list not found');

    if (readingList.properties().userId !== userId)
      throw new ForbiddenException(
        'No tienes permiso para agregar libros a esta lista',
      );

    const existingItems =
      await this.listItemRepository.getItemsByListId(listId);
    const alreadyExists = existingItems.some(
      (item) => item.properties().bookId === addBookToListDto.bookId,
    );
    if (alreadyExists)
      throw new ConflictException('El libro ya está en esta lista');

    const listItem = new ListItem({
      id: generateUUID(),
      readingListId: listId,
      bookId: addBookToListDto.bookId,
      position: addBookToListDto.position,
      notes: addBookToListDto.notes,
    });

    const createdItem = await this.listItemRepository.addBookToList(listItem);

    if (!createdItem)
      throw new InternalServerErrorException(
        'Error adding book to reading list',
      );

    return createdItem;
  }
}
