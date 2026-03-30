import {
  type InferInput,
  boolean,
  maxLength,
  minLength,
  nonEmpty,
  object,
  optional,
  pipe,
  string,
} from 'valibot';

export const CreateReadingListSchema = object({
  name: pipe(
    string(),
    nonEmpty('El nombre es requerido'),
    minLength(2, 'El nombre debe tener al menos 2 caracteres'),
    maxLength(100, 'El nombre debe tener máximo 100 caracteres'),
  ),
  description: optional(
    pipe(
      string(),
      maxLength(500, 'La descripción debe tener máximo 500 caracteres'),
    ),
  ),
  category: pipe(
    string(),
    nonEmpty('La categoría es requerida'),
    minLength(2, 'La categoría debe tener al menos 2 caracteres'),
    maxLength(50, 'La categoría debe tener máximo 50 caracteres'),
  ),
  isPublic: optional(boolean(), true),
});

export type CreateReadingListDto = InferInput<typeof CreateReadingListSchema>;
