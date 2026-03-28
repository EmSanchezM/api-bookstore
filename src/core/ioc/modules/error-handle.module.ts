import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { GlobalErrorFilter } from '@/modules/shared/middlewares/error-handlers';

export const errorHandleModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(GlobalErrorFilter).toSelf();
  },
);
