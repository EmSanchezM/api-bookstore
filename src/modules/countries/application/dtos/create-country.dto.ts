import * as v from 'valibot';

export const CreateCountrySchema = v.object({
  name: v.pipe(
    v.string(),
    v.nonEmpty('Country name is required'),
    v.minLength(2, 'Country name must be at least 3 characters'),
    v.maxLength(100, 'Country name must be at most 100 characters'),
  ),
  isoCode: v.pipe(
    v.string(),
    v.nonEmpty('ISO code is required'),
    v.minLength(2, 'ISO code must be at least 2 characters'),
  ),
});

export type CreateCountryDto = v.InferInput<typeof CreateCountrySchema>;
