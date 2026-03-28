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
  await container.load(
    countryModule,
    languageModule,
    publisherModule,
    authorModule,
    bookModule,
    errorHandleModule,
  );

  return container;
};
