import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { PublisherRepository } from '@/modules/publishers/domain/repositories';

@injectable()
export class FindAllPublishersUseCase {
  constructor(@inject(TYPES.PublisherRepository) private publisherRepository: PublisherRepository) {}

  async execute() {
    const publishers = await this.publisherRepository.getAllPublishers();

    if (!publishers.length) return [];

    return publishers;
  }
}
