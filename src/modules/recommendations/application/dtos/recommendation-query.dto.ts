import {
  type InferInput,
  integer,
  maxValue,
  minValue,
  number,
  object,
  optional,
  pipe,
  string,
  transform,
} from 'valibot';

export const RecommendationQuerySchema = object({
  limit: optional(
    pipe(
      string(),
      transform(Number),
      number('El limit debe ser un número'),
      integer('El limit debe ser un entero'),
      minValue(1, 'El limit debe ser al menos 1'),
      maxValue(50, 'El limit debe ser máximo 50'),
    ),
  ),
});

export type RecommendationQueryDto = InferInput<
  typeof RecommendationQuerySchema
>;

export const TrendingQuerySchema = object({
  limit: optional(
    pipe(
      string(),
      transform(Number),
      number('El limit debe ser un número'),
      integer('El limit debe ser un entero'),
      minValue(1, 'El limit debe ser al menos 1'),
      maxValue(50, 'El limit debe ser máximo 50'),
    ),
  ),
  days: optional(
    pipe(
      string(),
      transform(Number),
      number('Los days deben ser un número'),
      integer('Los days deben ser un entero'),
      minValue(1, 'Los days deben ser al menos 1'),
      maxValue(365, 'Los days deben ser máximo 365'),
    ),
  ),
});

export type TrendingQueryDto = InferInput<typeof TrendingQuerySchema>;
