import { isNumber, isObject, isString } from './shared.utils';
import {
  DescriptionAndOptions,
  HttpExceptionBody,
  HttpExceptionBodyMessage,
  HttpExceptionOptions,
  HttpExceptionResponse,
} from './types';

export class HttpException extends Error {
  public cause: unknown;

  /**
   * @param {string | object} response - String or object describing the error condition or the error cause.
   * @param {number} status - HTTP response status code.
   * @param {object} [options] - An object used to add an error cause with two values cause?: unknown; description?: string;
   */
  constructor(
    private readonly response: string | Record<string, any>,
    private readonly status: number,
    private readonly options: HttpExceptionOptions,
  ) {
    super();
    this.initMessage();
    this.initName();
    this.initCause();
  }

  private initMessage(): void {
    if (isString(this.response)) {
      this.message = this.response;
    } else if (isObject(this.response) && isString(this.response.message)) {
      this.message = this.response.message;
    } else if (this.constructor) {
      this.message = this.constructor.name.match(/[A-Z][a-z]+|[0-9]+/g)?.join(' ') || 'Error';
    }
  }

  private initName(): void {
    this.name = this.constructor.name;
  }

  private initCause(): void {
    if (this.options?.cause) {
      this.cause = this.options.cause;
      return;
    }
  }

  public getResponse(): string | object {
    return this.response;
  }

  public getStatus(): number {
    return this.status;
  }

  public getOptions(): HttpExceptionOptions {
    return this.options;
  }

  public static createBody(nil: null | '', message: HttpExceptionBodyMessage, statusCode: number): HttpExceptionBody;
  public static createBody(message: HttpExceptionBodyMessage, error: string, statusCode: number): HttpExceptionBody;
  public static createBody<Body extends Record<string, unknown>>(custom: Body): Body;
  public static createBody<Body extends Record<string, unknown>>(
    arg0: null | HttpExceptionBodyMessage | Body,
    arg1?: HttpExceptionBodyMessage | string,
    statusCode?: number,
  ): HttpExceptionBody | Body {
    if (!arg0) {
      return {
        message: arg1!,
        statusCode: statusCode!,
      };
    }

    if (isString(arg0) || Array.isArray(arg0) || isNumber(arg0)) {
      return {
        message: arg0,
        error: arg1 as string,
        statusCode: statusCode!,
      };
    }

    return arg0;
  }

  public static getDescriptionFrom(descriptionOrOptions: string | HttpExceptionOptions): string {
    return isString(descriptionOrOptions) ? descriptionOrOptions : (descriptionOrOptions?.description as string);
  }

  public static getHttpExceptionOptionsFrom(descriptionOrOptions: string | HttpExceptionOptions): HttpExceptionOptions {
    return isString(descriptionOrOptions) ? {} : descriptionOrOptions;
  }

  /**
   * Utility method used to extract the error description and httpExceptionOptions from the given argument.
   * This is used by inheriting classes to correctly parse both options.
   * @returns the error description and the httpExceptionOptions as an object.
   */
  public static extractDescriptionAndOptionsFrom(
    descriptionOrOptions: string | HttpExceptionOptions,
  ): DescriptionAndOptions {
    const description = isString(descriptionOrOptions) ? descriptionOrOptions : descriptionOrOptions?.description;

    const httpExceptionOptions = isString(descriptionOrOptions) ? {} : descriptionOrOptions;

    return {
      description,
      httpExceptionOptions,
    };
  }
}
