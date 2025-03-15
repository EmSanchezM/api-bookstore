import { HttpException } from './http.exception';
import { HttpStatus } from './http.status';
import { HttpExceptionOptions } from './types';

/**
 * Defines an HTTP exception for *Bad Gateway* type errors.
 *
 * The HTTP response status code is 502.
 *
 * @publicApi
 */
export class BadGatewayException extends HttpException {
  /**
   * Instantiate a `BadGatewayException` Exception.
   *
   * @example
   * `throw new BadGatewayException()`
   *
   * @usageNotes
   * The HTTP response status code will be 502.
   * - The `objectOrError` argument defines the JSON response body or the message string.
   * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
   *
   * By default, the JSON response body contains two properties:
   * - `statusCode`: this will be the value 502.
   * - `message`: the string `'Bad Gateway'` by default; override this by supplying
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
  constructor(objectOrError?: any, descriptionOrOptions: string | HttpExceptionOptions = 'Bad Gateway') {
    const { description, httpExceptionOptions } = HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);

    super(
      HttpException.createBody(objectOrError, description!, HttpStatus.BAD_GATEWAY),
      HttpStatus.BAD_GATEWAY,
      httpExceptionOptions,
    );
  }
}
