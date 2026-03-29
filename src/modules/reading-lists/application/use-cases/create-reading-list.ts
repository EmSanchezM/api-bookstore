import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { CreateReadingListDto } from '@/modules/reading-lists/application/dtos';
import { ReadingList } from '@/modules/reading-lists/domain/entities';
import type { ReadingListRepository } from '@/modules/reading-lists/domain/repositories';
import { InternalServerErrorException } from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class CreateReadingListUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
  ) {}

  async execute(userId: string, createReadingListDto: CreateReadingListDto) {
    const readingList = new ReadingList({
      id: generateUUID(),
      userId,
      name: createReadingListDto.name,
      description: createReadingListDto.description,
      category: createReadingListDto.category,
      isPublic: createReadingListDto.isPublic ?? true,
      isActive: true,
    });

    const createdList =
      await this.readingListRepository.createReadingList(readingList);

    if (!createdList)
      throw new InternalServerErrorException('Error creating reading list');

    return createdList;
  }
}
