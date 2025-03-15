import { HttpException } from './http.exception';
import { HttpStatus } from './http.status';
import { HttpExceptionOptions } from './types';

/**
 * Defines an HTTP exception for *Forbidden* type errors.
 *
 * The HTTP response status code is 403.
 *
 * @publicApi
 */
export class ForbiddenException extends HttpException {
  /**
   * Instantiate a `ForbiddenException` Exception.
   *
   * @example
   * `throw new ForbiddenException()`
   *
   * @usageNotes
   * The HTTP response status code will be 403.
   * - The `objectOrError` argument defines the JSON response body or the message string.
   * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
   *
   * By default, the JSON response body contains two properties:
   * - `statusCode`: this will be the value 403.
   * - `message`: the string `'Forbidden'` by default; override this by supplying
   * a string in the `objectOrError` parameter.
   *
   * If the parameter `objectOrError` is a string, the response body will contain an
   * additional property, `error`, with a short description of the HTTP error. To override the
   * entire JSON response body, pass an object instead. Nest will serialize the object
   * and return it as the JSON response body.
   *
   * @param objectOrError string or object describing the error condition.
   * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
   */
  constructor(objectOrError?: any, descriptionOrOptions: string | HttpExceptionOptions = 'Forbidden') {
    const { description, httpExceptionOptions } = HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);

    super(
      HttpException.createBody(objectOrError, description!, HttpStatus.FORBIDDEN),
      HttpStatus.FORBIDDEN,
      httpExceptionOptions,
    );
  }
}
