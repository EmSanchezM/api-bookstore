import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';

import { Author } from '@/modules/authors/domain/entities';
import { AuthorRepository } from '@/modules/authors/domain/repositories';
import { CreateAuthorDto } from '@/modules/authors/application/dtos';
import { InternalServerErrorException } from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class CreateAuthorUseCase {
  constructor(@inject(TYPES.AuthorRepository) private authorRepository: AuthorRepository) {}

  async execute(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = new Author({
      id: generateUUID(),
      isActive: true,
      ...createAuthorDto,
    });

    const createdAuthor = await this.authorRepository.createAuthor(author);

    if (!createdAuthor) throw new InternalServerErrorException('Error creating author');

    return createdAuthor;
  }
}
