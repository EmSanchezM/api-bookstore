import { ContainerModule } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import { ErrorHandlerMiddleware } from '@/modules/shared/middlewares/error-handlers';

export const errorHandleModule = new ContainerModule((bind) => {
  bind(TYPES.ErrorHandlerMiddleware).to(ErrorHandlerMiddleware);
});
