import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';

import { Publisher } from '@/modules/publishers/domain/entities';
import { PublisherRepository } from '@/modules/publishers/domain/repositories';
import { CreatePublisherDto } from '@/modules/publishers/application/dtos';
import { InternalServerErrorException } from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class CreatePublisherUseCase {
  constructor(@inject(TYPES.PublisherRepository) private publisherRepository: PublisherRepository) {}

  async execute(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    const publisher = new Publisher({
      id: generateUUID(),
      isActive: true,
      ...createPublisherDto,
    });

    const createdPublisher = await this.publisherRepository.createPublisher(publisher);

    if (!createdPublisher) throw new InternalServerErrorException('Error creating publisher');

    return createdPublisher;
  }
}
