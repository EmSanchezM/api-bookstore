import {
  CatchError,
  type ErrorFilter,
  isHttpResponse,
} from '@inversifyjs/http-core';
import type express from 'express';
import { envVariables, logger } from '@/core/config';
import { HttpException, HttpStatus } from '../exceptions';

@CatchError()
export class GlobalErrorFilter implements ErrorFilter {
  public catch(
    error: unknown,
    _request: express.Request,
    response: express.Response,
  ): void {
    if (isHttpResponse(error)) {
      response.status(error.statusCode).json(error.body);
      return;
    }

    if (error instanceof HttpException) {
      response.status(error.getStatus()).json({
        status: error.getStatus(),
        ...(error.getResponse() as object),
        stack: envVariables.NODE_ENV !== 'production' ? error.stack : undefined,
      });
      return;
    }

    logger.error('Unhandled error:', error);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      error: 'InternalServerError',
      stack:
        envVariables.NODE_ENV !== 'production' && error instanceof Error
          ? error.stack
          : undefined,
    });
  }
}
