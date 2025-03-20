import { Language } from '@/modules/languages/domain/entities';
import { LanguageFilters } from '@/modules/languages/infrastructure/types/language.filters';

export interface LanguageRepository {
  getLanguageById(id: string): Promise<Language | null>;
  getLanguageByIsoCode(isoCode: string): Promise<Language | null>;
  getAllLanguages(): Promise<Language[]>;
  getLanguagesByFilters(filters: LanguageFilters): Promise<Language[]>;
  createLanguage(Language: Language): Promise<Language | null>;
  updateLanguage(id: string, language: Language): Promise<Language | null>;
  deleteLanguage(id: string): Promise<boolean>;
  toggleLanguageStatus(id: string): Promise<boolean>;
}
