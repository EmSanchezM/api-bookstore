import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { PublisherRepository } from '@/modules/publishers/domain/repositories';
import { UpdatePublisherDto } from '@/modules/publishers/application/dtos';
import { DatabaseErrorException, NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class UpdatePublisherUseCase {
  constructor(@inject(TYPES.PublisherRepository) private publisherRepository: PublisherRepository) {}

  async execute(id: string, updatePublisherDto: UpdatePublisherDto) {
    const existingPublisher = await this.publisherRepository.getPublisherById(id);

    if (!existingPublisher) throw new NotFoundException('Publisher not found');

    existingPublisher.update({
      ...updatePublisherDto,
    });

    const updatedPublisher = await this.publisherRepository.updatePublisher(
      existingPublisher.properties().id!,
      existingPublisher,
    );

    if (!updatedPublisher) throw new DatabaseErrorException('Error updating publisher');

    return updatedPublisher;
  }
}
