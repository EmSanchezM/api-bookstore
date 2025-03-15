import { ContainerModule } from 'inversify';
import { ErrorHandlerMiddleware } from '@/modules/shared/middlewares/error-handlers';
import { TYPES } from '@/core/common/constants/types';

export const errorHandleModule = new ContainerModule((bind) => {
  bind(TYPES.ErrorHandlerMiddleware).to(ErrorHandlerMiddleware);
});
