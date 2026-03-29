import {
  type InferInput,
  integer,
  maxLength,
  minValue,
  number,
  object,
  optional,
  pipe,
  string,
} from 'valibot';

export const UpdateListItemSchema = object({
  position: optional(
    pipe(
      number(),
      integer('La posición debe ser un número entero'),
      minValue(0, 'La posición debe ser mayor o igual a 0'),
    ),
  ),
  notes: optional(
    pipe(
      string(),
      maxLength(500, 'Las notas deben tener máximo 500 caracteres'),
    ),
  ),
});

export type UpdateListItemDto = InferInput<typeof UpdateListItemSchema>;
