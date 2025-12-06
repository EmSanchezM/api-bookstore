import { AsyncContainerModule } from 'inversify';
import type Surreal from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { Database } from '@/core/database';

export const databaseModule = new AsyncContainerModule(async (bind) => {
  const database = Database.getInstance();
  const connection = await database.getConnection();

  bind<Database>(TYPES.Database).toConstantValue(database);
  bind<Surreal>(TYPES.DatabaseConnection).toConstantValue(connection);
});
