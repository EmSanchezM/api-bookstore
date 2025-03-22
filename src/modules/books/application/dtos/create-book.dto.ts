import { pipe, string, object, nonEmpty, minLength, maxLength, type InferInput, array } from 'valibot';

export const CreateBookSchema = object({
  title: pipe(
    string(),
    nonEmpty('Book title is required'),
    minLength(1, 'Book title must be at least 2 characters'),
    maxLength(100, 'Book title must be at most 100 characters'),
  ),
  isbn: pipe(
    string(),
    nonEmpty('Book isbn is required'),
    minLength(1, 'Book isbn must be at least 2 characters'),
    maxLength(100, 'Book isbn must be at most 100 characters'),
  ),
  publicationDate: pipe(
    string(),
    nonEmpty('Book publicationDate is required'),
    minLength(1, 'Book publicationDate must be at least 2 characters'),
    maxLength(100, 'Book publicationDate must be at most 100 characters'),
  ),
  publisher: pipe(
    string(),
    nonEmpty('Book publisher is required'),
  ),
  authors: pipe(
    array(string()),
    nonEmpty('Book authors is required'),
  ),
  languages: pipe(
    array(string()),
    nonEmpty('Book languages is required'),
  ),
});

export type CreateBookDto = InferInput<typeof CreateBookSchema>;
