import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { LanguageRepository } from '@/modules/languages/domain/repositories';
import { InternalServerErrorException, NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class RemoveLanguageUseCase {
  constructor(@inject(TYPES.LanguageRepository) private languageRepository: LanguageRepository) {}

  async execute(id: string) {
    const language = await this.languageRepository.getLanguageById(id);

    if (!language) throw new NotFoundException('Language not found');

    const deletedLanguage = await this.languageRepository.deleteLanguage(language.properties().id!);

    if (!deletedLanguage) throw new InternalServerErrorException('Error deleting language');

    return deletedLanguage;
  }
}
