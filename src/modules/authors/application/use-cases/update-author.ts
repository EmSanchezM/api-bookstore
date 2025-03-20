import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { AuthorRepository } from '@/modules/authors/domain/repositories';
import { UpdateAuthorDto } from '@/modules/authors/application/dtos';
import { DatabaseErrorException, NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class UpdateAuthorUseCase {
  constructor(@inject(TYPES.AuthorRepository) private authorRepository: AuthorRepository) {}

  async execute(id: string, updateAuthorDto: UpdateAuthorDto) {
    const existingAuthor = await this.authorRepository.getAuthorById(id);

    if (!existingAuthor) throw new NotFoundException('Author not found');

    existingAuthor.update({
      ...updateAuthorDto,
    });

    const updatedAuthor = await this.authorRepository.updateAuthor(
      existingAuthor.properties().id!,
      existingAuthor,
    );

    if (!updatedAuthor) throw new DatabaseErrorException('Error updating author');

    return updatedAuthor;
  }
}
