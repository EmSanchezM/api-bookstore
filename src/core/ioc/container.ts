import { Container } from 'inversify';

import {
  authorModule,
  bookModule,
  countryModule,
  databaseModule,
  errorHandleModule,
  languageModule,
  publisherModule,
} from './modules';

export const container = new Container();

export const loadContainer = async () => {
  await container.loadAsync(databaseModule);
  container.load(countryModule);
  container.load(languageModule);
  container.load(publisherModule);
  container.load(authorModule);
  container.load(bookModule);
  container.load(errorHandleModule);

  return container;
};
