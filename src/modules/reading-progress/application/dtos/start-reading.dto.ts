import {
  type InferInput,
  integer,
  minValue,
  nonEmpty,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
} from 'valibot';

export const StartReadingSchema = object({
  bookId: pipe(string(), nonEmpty('El bookId es requerido')),
  totalPages: pipe(
    number('El total de páginas debe ser un número'),
    integer('El total de páginas debe ser un entero'),
    minValue(1, 'El total de páginas debe ser al menos 1'),
  ),
  status: optional(
    picklist(
      ['want_to_read', 'reading', 'finished', 'abandoned'],
      'Estado inválido',
    ),
    'want_to_read',
  ),
});

export type StartReadingDto = InferInput<typeof StartReadingSchema>;
