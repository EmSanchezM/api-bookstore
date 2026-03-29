import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { UpdateReadingListDto } from '@/modules/reading-lists/application/dtos';
import type { ReadingListRepository } from '@/modules/reading-lists/domain/repositories';
import {
  DatabaseErrorException,
  ForbiddenException,
  NotFoundException,
} from '@/modules/shared/exceptions';

@injectable()
export class UpdateReadingListUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    updateReadingListDto: UpdateReadingListDto,
  ) {
    const existingList =
      await this.readingListRepository.getReadingListById(id);

    if (!existingList) throw new NotFoundException('Reading list not found');

    if (existingList.properties().userId !== userId)
      throw new ForbiddenException(
        'No tienes permiso para actualizar esta lista',
      );

    existingList.update({
      name: updateReadingListDto.name,
      description: updateReadingListDto.description,
      category: updateReadingListDto.category,
      isPublic: updateReadingListDto.isPublic,
    });

    const updatedList = await this.readingListRepository.updateReadingList(
      existingList.properties().id!,
      existingList,
    );

    if (!updatedList)
      throw new DatabaseErrorException('Error updating reading list');

    return updatedList;
  }
}
