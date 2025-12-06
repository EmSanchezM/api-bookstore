import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { AuthorRepository } from '@/modules/authors/domain/repositories';
import type { AuthorFilters } from '@/modules/authors/infrastructure/types/author.filters';

@injectable()
export class FindByFiltersAuthorUseCase {
  constructor(
    @inject(TYPES.AuthorRepository) private authorRepository: AuthorRepository,
  ) {}

  async execute(filters: AuthorFilters) {
    const authors = await this.authorRepository.getAuthorsByFilters(filters);

    if (!authors.length) return [];

    return authors;
  }
}
