import { pipe, string, object, nonEmpty, minLength, maxLength, url, array, date, type InferInput } from 'valibot';

export const CreateAuthorSchema = object({
  firstName: pipe(
    string(),
    nonEmpty('Publisher name is required'),
    minLength(1, 'Publisher name must be at least 2 characters'),
    maxLength(100, 'Publisher name must be at most 100 characters'),
  ),
  lastName: pipe(
    string(),
    nonEmpty('Publisher name is required'),
    minLength(1, 'Publisher name must be at least 2 characters'),
    maxLength(100, 'Publisher name must be at most 100 characters'),
  ),
  nationality: pipe(
    string(),
    nonEmpty('Publisher name is required'),
    minLength(1, 'Publisher name must be at least 2 characters'),
    maxLength(100, 'Publisher name must be at most 100 characters'),
  ),
  biography: pipe(string(), url('Publisher website is invalid')),
  awards: pipe(array(string())),
  genres: pipe(array(string())),
  notableWorks: pipe(array(string())),
  socialLinks: pipe(object({ facebook: string(), twitter: string(), instagram: string() })),
  website: pipe(string(), url('Publisher website is invalid')),
  birthDate: pipe(date()),
  dateOfDeath: pipe(date()),
});

export type CreateAuthorDto = InferInput<typeof CreateAuthorSchema>;
