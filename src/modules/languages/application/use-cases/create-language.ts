import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import type { CreateLanguageDto } from '@/modules/languages/application/dtos';
import { Language } from '@/modules/languages/domain/entities';
import type { LanguageRepository } from '@/modules/languages/domain/repositories';
import { InternalServerErrorException } from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class CreateLanguageUseCase {
  constructor(
    @inject(TYPES.LanguageRepository)
    private languageRepository: LanguageRepository,
  ) {}

  async execute(createLanguageDto: CreateLanguageDto): Promise<Language> {
    const language = new Language({
      id: generateUUID(),
      isActive: true,
      ...createLanguageDto,
    });

    const createdLanguage =
      await this.languageRepository.createLanguage(language);

    if (!createdLanguage)
      throw new InternalServerErrorException('Error creating language');

    return createdLanguage;
  }
}
