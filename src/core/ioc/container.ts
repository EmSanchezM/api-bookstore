import { Container } from 'inversify';

import {
  databaseModule,
  errorHandleModule,
  countryModule,
  languageModule,
  publisherModule,
  authorModule,
  bookModule,
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
