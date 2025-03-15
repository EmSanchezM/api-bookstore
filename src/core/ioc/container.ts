import { Container } from 'inversify';
import { countryModule } from './modules/country.module';
import { databaseModule } from './modules/database.module';
import { errorHandleModule } from './modules/error-handle.module';

export const container = new Container();

export const loadContainer = async () => {
  await container.loadAsync(databaseModule);
  container.load(countryModule);
  container.load(errorHandleModule);
  
  return container;
};