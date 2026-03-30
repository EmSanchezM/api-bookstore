import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { ReadingListRepository } from '@/modules/reading-lists/domain/repositories';
import {
  ForbiddenException,
  NotFoundException,
} from '@/modules/shared/exceptions';

@injectable()
export class FindByIdReadingListUseCase {
  constructor(
    @inject(TYPES.ReadingListRepository)
    private readingListRepository: ReadingListRepository,
  ) {}

  async execute(id: string, requestUserId?: string) {
    const readingList = await this.readingListRepository.getReadingListById(id);

    if (!readingList) throw new NotFoundException('Reading list not found');

    const props = readingList.properties();

    if (!props.isPublic && props.userId !== requestUserId)
      throw new ForbiddenException(
        'No tienes permiso para ver esta lista privada',
      );

    return readingList;
  }
}
