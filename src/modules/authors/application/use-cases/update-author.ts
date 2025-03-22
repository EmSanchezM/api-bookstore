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
      firstName: updateAuthorDto.firstName ? updateAuthorDto.firstName : undefined,
      lastName: updateAuthorDto.lastName ? updateAuthorDto.lastName : undefined,
      nationality: updateAuthorDto.nationality ? updateAuthorDto.nationality : undefined,
      biography: updateAuthorDto.biography ? updateAuthorDto.biography : undefined,
      birthDate: updateAuthorDto.birthDate ? new Date(updateAuthorDto.birthDate) : undefined,
      dateOfDeath: updateAuthorDto.dateOfDeath ? new Date(updateAuthorDto.dateOfDeath) : undefined,
      socialLinks: updateAuthorDto.socialLinks
        ? {
            facebook: updateAuthorDto.socialLinks.facebook,
            twitter: updateAuthorDto.socialLinks.twitter,
            instagram: updateAuthorDto.socialLinks.instagram,
          }
        : undefined,
      website: updateAuthorDto.website ? updateAuthorDto.website : undefined,
      awards: updateAuthorDto.awards ? updateAuthorDto.awards : undefined,
      genres: updateAuthorDto.genres ? updateAuthorDto.genres : undefined,
      notableWorks: updateAuthorDto.notableWorks ? updateAuthorDto.notableWorks : undefined,
    });

    const updatedAuthor = await this.authorRepository.updateAuthor(
      existingAuthor.properties().id!,
      existingAuthor,
    );

    if (!updatedAuthor) throw new DatabaseErrorException('Error updating author');

    return updatedAuthor;
  }
}
