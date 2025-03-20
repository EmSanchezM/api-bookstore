import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { LanguageRepository } from '@/modules/languages/domain/repositories';
import { LanguageFilters } from '@/modules/languages/infrastructure/types/language.filters';

@injectable()
export class FindByFiltersLanguageUseCase {
  constructor(@inject(TYPES.LanguageRepository) private languageRepository: LanguageRepository) {}

  async execute(filters: LanguageFilters) {
    const languages = await this.languageRepository.getLanguagesByFilters(filters);

    if (!languages.length) return [];

    return languages;
  }
}
