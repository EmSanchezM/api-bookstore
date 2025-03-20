import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { PublisherRepository } from '@/modules/publishers/domain/repositories';
import { InternalServerErrorException, NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class RemovePublisherUseCase {
  constructor(@inject(TYPES.PublisherRepository) private PublisherRepository: PublisherRepository) {}

  async execute(id: string) {
    const publisher = await this.PublisherRepository.getPublisherById(id);

    if (!publisher) throw new NotFoundException('Publisher not found');

    const deletedPublisher = await this.PublisherRepository.deletePublisher(publisher.properties().id!);

    if (!deletedPublisher) throw new InternalServerErrorException('Error deleting publisher');

    return deletedPublisher;
  }
}
