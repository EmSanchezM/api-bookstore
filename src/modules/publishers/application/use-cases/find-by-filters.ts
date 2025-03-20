import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { PublisherRepository } from '@/modules/publishers/domain/repositories';
import { PublisherFilters } from '@/modules/publishers/infrastructure/types/publisher.filters';

@injectable()
export class FindByFiltersPublisherUseCase {
  constructor(@inject(TYPES.PublisherRepository) private publisherRepository: PublisherRepository) {}

  async execute(filters: PublisherFilters) {
    const publishers = await this.publisherRepository.getPublishersByFilters(filters);

    if (!publishers.length) return [];

    return publishers;
  }
}
