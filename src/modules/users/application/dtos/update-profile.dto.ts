import {
  type InferInput,
  email,
  maxLength,
  minLength,
  object,
  optional,
  partial,
  pipe,
  regex,
  string,
  url,
} from 'valibot';

export const UpdateProfileSchema = partial(
  object({
    firstName: pipe(
      string(),
      minLength(2, 'El nombre debe tener al menos 2 caracteres'),
      maxLength(50, 'El nombre debe tener máximo 50 caracteres'),
      regex(
        /^[a-zA-ZÀ-ÿ\s]*$/,
        'El nombre solo puede contener letras y espacios',
      ),
    ),
    lastName: pipe(
      string(),
      minLength(2, 'El apellido debe tener al menos 2 caracteres'),
      maxLength(50, 'El apellido debe tener máximo 50 caracteres'),
      regex(
        /^[a-zA-ZÀ-ÿ\s]*$/,
        'El apellido solo puede contener letras y espacios',
      ),
    ),
    email: pipe(string(), email('El email no es válido')),
    avatar: pipe(string(), url('La URL del avatar no es válida')),
    bio: pipe(
      string(),
      maxLength(500, 'La biografía debe tener máximo 500 caracteres'),
    ),
  }),
);

export type UpdateProfileDto = InferInput<typeof UpdateProfileSchema>;
