import {
  type InferInput,
  integer,
  minValue,
  number,
  object,
  optional,
  picklist,
  pipe,
} from 'valibot';

export const UpdateProgressSchema = object({
  currentPage: optional(
    pipe(
      number('La página actual debe ser un número'),
      integer('La página actual debe ser un entero'),
      minValue(0, 'La página actual debe ser al menos 0'),
    ),
  ),
  totalPages: optional(
    pipe(
      number('El total de páginas debe ser un número'),
      integer('El total de páginas debe ser un entero'),
      minValue(1, 'El total de páginas debe ser al menos 1'),
    ),
  ),
  status: optional(
    picklist(
      ['want_to_read', 'reading', 'finished', 'abandoned'],
      'Estado inválido',
    ),
  ),
});

export type UpdateProgressDto = InferInput<typeof UpdateProgressSchema>;
