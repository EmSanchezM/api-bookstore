import {
  type InferInput,
  email,
  maxLength,
  minLength,
  nonEmpty,
  object,
  pipe,
  regex,
  string,
} from 'valibot';

export const RegisterUserSchema = object({
  firstName: pipe(
    string(),
    nonEmpty('El nombre es requerido'),
    minLength(2, 'El nombre debe tener al menos 2 caracteres'),
    maxLength(50, 'El nombre debe tener máximo 50 caracteres'),
    regex(
      /^[a-zA-ZÀ-ÿ\s]*$/,
      'El nombre solo puede contener letras y espacios',
    ),
  ),
  lastName: pipe(
    string(),
    nonEmpty('El apellido es requerido'),
    minLength(2, 'El apellido debe tener al menos 2 caracteres'),
    maxLength(50, 'El apellido debe tener máximo 50 caracteres'),
    regex(
      /^[a-zA-ZÀ-ÿ\s]*$/,
      'El apellido solo puede contener letras y espacios',
    ),
  ),
  email: pipe(
    string(),
    nonEmpty('El email es requerido'),
    email('El email no es válido'),
  ),
  password: pipe(
    string(),
    nonEmpty('La contraseña es requerida'),
    minLength(8, 'La contraseña debe tener al menos 8 caracteres'),
    regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula'),
    regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula'),
    regex(/[0-9]/, 'La contraseña debe tener al menos un número'),
  ),
});

export type RegisterUserDto = InferInput<typeof RegisterUserSchema>;
