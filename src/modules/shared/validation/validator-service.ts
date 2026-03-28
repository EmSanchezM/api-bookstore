import { type BaseIssue, type BaseSchema, safeParse } from 'valibot';

export function validate<
  T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: T, data: unknown) {
  return safeParse(schema, data);
}
