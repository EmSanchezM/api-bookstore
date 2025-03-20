import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { PublisherRepository } from '@/modules/publishers/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class FindByIdPublisherUseCase {
  constructor(@inject(TYPES.PublisherRepository) private publisherRepository: PublisherRepository) {}

  async execute(id: string) {
    const publisher = await this.publisherRepository.getPublisherById(id);

    if (!publisher) throw new NotFoundException('Publisher not found');

    return publisher;
  }
}
