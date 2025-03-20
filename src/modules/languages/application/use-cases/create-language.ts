import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';

import { Language } from '@/modules/languages/domain/entities';
import { LanguageRepository } from '@/modules/languages/domain/repositories';
import { CreateLanguageDto } from '@/modules/languages/application/dtos';
import { InternalServerErrorException } from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class CreateLanguageUseCase {
  constructor(@inject(TYPES.LanguageRepository) private languageRepository: LanguageRepository) {}

  async execute(createLanguageDto: CreateLanguageDto): Promise<Language> {
    const language = new Language({
      id: generateUUID(),
      isActive: true,
      ...createLanguageDto,
    });

    const createdLanguage = await this.languageRepository.createLanguage(language);

    if (!createdLanguage) throw new InternalServerErrorException('Error creating language');

    return createdLanguage;
  }
}
