import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { AuthorRepository } from '@/modules/authors/domain/repositories';

@injectable()
export class FindAllAuthorsUseCase {
  constructor(@inject(TYPES.AuthorRepository) private authorRepository: AuthorRepository) {}

  async execute() {
    const authors = await this.authorRepository.getAllAuthors();

    if (!authors.length) return [];

    return authors;
  }
}
