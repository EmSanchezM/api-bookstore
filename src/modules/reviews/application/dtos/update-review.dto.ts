import {
  type InferInput,
  integer,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  pipe,
  string,
} from 'valibot';

export const UpdateReviewSchema = object({
  rating: optional(
    pipe(
      number('El rating debe ser un número'),
      integer('El rating debe ser un entero'),
      minValue(1, 'El rating debe ser al menos 1'),
      maxValue(5, 'El rating debe ser máximo 5'),
    ),
  ),
  title: optional(
    pipe(
      string(),
      minLength(2, 'El título debe tener al menos 2 caracteres'),
      maxLength(200, 'El título debe tener máximo 200 caracteres'),
    ),
  ),
  body: optional(
    pipe(
      string(),
      minLength(10, 'El cuerpo debe tener al menos 10 caracteres'),
      maxLength(5000, 'El cuerpo debe tener máximo 5000 caracteres'),
    ),
  ),
});

export type UpdateReviewDto = InferInput<typeof UpdateReviewSchema>;
