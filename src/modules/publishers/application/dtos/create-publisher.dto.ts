import { pipe, string, object, nonEmpty, minLength, maxLength, url, type InferInput } from 'valibot';

export const CreatePublisherSchema = object({
  name: pipe(
    string(),
    nonEmpty('Publisher name is required'),
    minLength(1, 'Publisher name must be at least 2 characters'),
    maxLength(100, 'Publisher name must be at most 100 characters'),
  ),
  website: pipe(string(), url('Publisher website is invalid')),
});

export type CreatePublisherDto = InferInput<typeof CreatePublisherSchema>;
