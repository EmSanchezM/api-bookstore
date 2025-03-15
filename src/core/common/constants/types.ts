import { Database } from "@/core/database";

export const TYPES = {
  Database: Symbol.for('Database'),
  DatabaseConnection: Symbol.for('DatabaseConnection'),
  CountryRepository: Symbol.for('CountryRepository'),
  CreateCountryUseCase: Symbol.for('CreateCountryUseCase'),
  FindAllCountriesUseCase: Symbol.for('FindAllCountriesUseCase'),
  FindByIdCountryUseCase: Symbol.for('FindByIdCountryUseCase'),
  FindByIsoCodeCountryUseCase: Symbol.for('FindByIsoCodeCountryUseCase'),
  UpdateCountryUseCase: Symbol.for('UpdateCountryUseCase'),
  RemoveCountryUseCase: Symbol.for('RemoveCountryUseCase'),
};
