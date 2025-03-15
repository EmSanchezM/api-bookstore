import { HttpStatus } from './http.status';

export interface HttpExceptionOptions {
  cause?: unknown;
  description?: string;
}

export type HttpExceptionBodyMessage = string | string[] | number;

export interface HttpExceptionBody {
  message: HttpExceptionBodyMessage;
  error?: string;
  statusCode: number;
}

export interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode: number;
}

export interface HttpRedirectResponse {
  url: string;
  statusCode: HttpStatus;
}

export interface DescriptionAndOptions {
  description?: string;
  httpExceptionOptions: HttpExceptionOptions;
}
