import { HttpExceptionOptions } from './types';

import { HttpException } from './http.exception';
import { HttpStatus } from './http.status';

export class BadConfigurationAccountRequestException extends HttpException {
  constructor(
    objectOrError: any,
    descriptionOrOptions: string | HttpExceptionOptions = 'Bad Configuration Account Request',
  ) {
    const { description, httpExceptionOptions } = HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);

    super(
      HttpException.createBody(objectOrError, description!, HttpStatus.FORBIDDEN),
      HttpStatus.FORBIDDEN,
      httpExceptionOptions,
    );
  }
}
