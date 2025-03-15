import { pipe, string, object, nonEmpty, minLength, maxLength, type InferInput } from 'valibot';

export const CreateCountrySchema = object({
  name: pipe(
    string(),
    nonEmpty('Country name is required'),
    minLength(2, 'Country name must be at least 3 characters'),
    maxLength(100, 'Country name must be at most 100 characters'),
  ),
  isoCode: pipe(string(), nonEmpty('ISO code is required'), minLength(2, 'ISO code must be at least 2 characters')),
});

export type CreateCountryDto = InferInput<typeof CreateCountrySchema>;
