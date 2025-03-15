import { safeParse } from 'valibot';

export class ValidationService {
  static validate(schema: any, data: unknown) {
    return safeParse(schema, data);
  }
}
