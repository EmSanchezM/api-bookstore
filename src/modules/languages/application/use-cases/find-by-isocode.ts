import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import { LanguageRepository } from '@/modules/languages/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class FindByIsoCodeLanguageUseCase {
  constructor(@inject(TYPES.LanguageRepository) private languageRepository: LanguageRepository) {}

  async execute(isoCode: string) {
    const language = await this.languageRepository.getLanguageByIsoCode(isoCode);

    if (!language) throw new NotFoundException('Language not found');

    return language;
  }
}
