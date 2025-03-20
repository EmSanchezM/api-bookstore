import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { LanguageRepository } from '@/modules/languages/domain/repositories';

@injectable()
export class FindAllLanguagesUseCase {
  constructor(@inject(TYPES.LanguageRepository) private languageRepository: LanguageRepository) {}

  async execute() {
    const languages = await this.languageRepository.getAllLanguages();

    if (!languages.length) return [];

    return languages;
  }
}
