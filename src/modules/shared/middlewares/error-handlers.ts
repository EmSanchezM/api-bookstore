import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';

import { HttpException, HttpStatus } from '../exceptions';
import { envVariables, logger } from '@/core/config';

@injectable()
export class ErrorHandlerMiddleware {
  public handle(error: Error, req: Request, res: Response, next: NextFunction) {
    if (error instanceof HttpException) {
      return res.status(error.getStatus()).json({
        status: error.getStatus(),
        ...(error.getResponse() as object),
        stack: envVariables.NODE_ENV !== 'production' ? error.stack : undefined,
      });
    }

    logger.error('Unhandled error:', error);
    return res.status(500).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      error: 'InternalServerError',
    });
  }

  public catchAll(error: Error, req: Request, res: Response, next: NextFunction) {
    this.handle(error, req, res, next);
  }
}
