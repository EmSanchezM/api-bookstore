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
import { type UserRole, ROLES } from '@/modules/shared/security/interfaces';

@injectable()
export class RemoveReadingListUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
    @inject(TYPES.ListItemRepository)
    private listItemRepository: ListItemRepository,
  ) {}

  async execute(id: string, userId: string, role?: UserRole) {
    const existingList =
      await this.readingListRepository.getReadingListById(id);

    if (!existingList) throw new NotFoundException('Reading list not found');

    if (role !== ROLES.ADMIN && existingList.properties().userId !== userId)
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta lista',
      );

    const items = await this.listItemRepository.getItemsByListId(id);
    for (const item of items) {
      const props = item.properties();
      await this.listItemRepository.removeBookFromList(id, props.bookId);
    }

    const deleted = await this.readingListRepository.deleteReadingList(id);

    if (!deleted)
      throw new InternalServerErrorException('Error deleting reading list');

    return deleted;
  }
}
