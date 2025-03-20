export const TYPES = {
  Database: Symbol.for('Database'),
  DatabaseConnection: Symbol.for('DatabaseConnection'),
  ErrorHandlerMiddleware: Symbol.for('ErrorHandlerMiddleware'),
  //Countries
  CountryRepository: Symbol.for('CountryRepository'),
  CreateCountryUseCase: Symbol.for('CreateCountryUseCase'),
  FindAllCountriesUseCase: Symbol.for('FindAllCountriesUseCase'),
  FindByFiltersCountryUseCase: Symbol.for('FindByFiltersCountryUseCase'),
  FindByIdCountryUseCase: Symbol.for('FindByIdCountryUseCase'),
  FindByIsoCodeCountryUseCase: Symbol.for('FindByIsoCodeCountryUseCase'),
  UpdateCountryUseCase: Symbol.for('UpdateCountryUseCase'),
  RemoveCountryUseCase: Symbol.for('RemoveCountryUseCase'),
  //Languages
  LanguageRepository: Symbol.for('LanguageRepository'),
  CreateLanguageUseCase: Symbol.for('CreateLanguageUseCase'),
  FindAllLanguagesUseCase: Symbol.for('FindAllLanguagesUseCase'),
  FindByFiltersLanguageUseCase: Symbol.for('FindByFiltersLanguageUseCase'),
  FindByIdLanguageUseCase: Symbol.for('FindByIdLanguageUseCase'),
  FindByIsoCodeLanguageUseCase: Symbol.for('FindByIsoCodeLanguageUseCase'),
  UpdateLanguageUseCase: Symbol.for('UpdateLanguageUseCase'),
  RemoveLanguageUseCase: Symbol.for('RemoveLanguageUseCase'),
  //Publishers
  PublisherRepository: Symbol.for('PublisherRepository'),
  CreatePublisherUseCase: Symbol.for('CreatePublisherUseCase'),
  FindAllPublishersUseCase: Symbol.for('FindAllPublishersUseCase'),
  FindByFiltersPublisherUseCase: Symbol.for('FindByFiltersPublisherUseCase'),
  FindByIdPublisherUseCase: Symbol.for('FindByIdPublisherUseCase'),
  UpdatePublisherUseCase: Symbol.for('UpdatePublisherUseCase'),
  RemovePublisherUseCase: Symbol.for('RemovePublisherUseCase'),
  //Authors
  AuthorRepository: Symbol.for('AuthorRepository'),
  CreateAuthorUseCase: Symbol.for('CreateAuthorUseCase'),
  FindAllAuthorsUseCase: Symbol.for('FindAllAuthorsUseCase'),
  FindByFiltersAuthorUseCase: Symbol.for('FindByFiltersAuthorUseCase'),
  FindByIdAuthorUseCase: Symbol.for('FindByIdAuthorUseCase'),
  UpdateAuthorUseCase: Symbol.for('UpdateAuthorUseCase'),
  RemoveAuthorUseCase: Symbol.for('RemoveAuthorUseCase'),
};
