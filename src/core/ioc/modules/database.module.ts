import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import type Surreal from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { Database } from '@/core/database';

export const databaseModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    const database = Database.getInstance();
    const connection = await database.getConnection();

    options.bind<Database>(TYPES.Database).toConstantValue(database);
    options.bind<Surreal>(TYPES.DatabaseConnection).toConstantValue(connection);
  },
);
