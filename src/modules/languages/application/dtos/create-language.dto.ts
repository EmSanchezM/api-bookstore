import { pipe, string, object, nonEmpty, minLength, maxLength, type InferInput } from 'valibot';

export const CreateLanguageSchema = object({
  name: pipe(
    string(),
    nonEmpty('Language name is required'),
    minLength(1, 'Language name must be at least 2 characters'),
    maxLength(100, 'Language name must be at most 100 characters'),
  ),
  isoCode: pipe(string(), nonEmpty('ISO code is required'), minLength(2, 'ISO code must be at least 2 characters')),
});

export type CreateLanguageDto = InferInput<typeof CreateLanguageSchema>;
