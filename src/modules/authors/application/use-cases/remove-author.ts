
import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { AuthorRepository } from '@/modules/authors/domain/repositories';
import { InternalServerErrorException, NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class RemoveAuthorUseCase {
  constructor(@inject(TYPES.AuthorRepository) private authorRepository: AuthorRepository) {}

  async execute(id: string) {
    const author = await this.authorRepository.getAuthorById(id);

    if (!author) throw new NotFoundException('Publisher not found');

    const deletedAuthor = await this.authorRepository.deleteAuthor(author.properties().id!);

    if (!deletedAuthor) throw new InternalServerErrorException('Error deleting author');

    return deletedAuthor;
  }
}
