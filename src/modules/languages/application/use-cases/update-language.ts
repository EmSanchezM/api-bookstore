import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { LanguageRepository } from '@/modules/languages/domain/repositories';
import { UpdateLanguageDto } from '@/modules/languages/application/dtos';
import { DatabaseErrorException, NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class UpdateLanguageUseCase {
  constructor(@inject(TYPES.LanguageRepository) private languageRepository: LanguageRepository) {}

  async execute(id: string, updateCountryDto: UpdateLanguageDto) {
    const existingLanguage = await this.languageRepository.getLanguageById(id);

    if (!existingLanguage) throw new NotFoundException('Country not found');

    existingLanguage.update({
      ...updateCountryDto,
    });

    const updatedLanguage = await this.languageRepository.updateLanguage(
      existingLanguage.properties().id!,
      existingLanguage,
    );

    if (!updatedLanguage) throw new DatabaseErrorException('Error updating language');

    return updatedLanguage;
  }
}
