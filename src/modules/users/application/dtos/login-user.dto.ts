import {
  type InferInput,
  email,
  nonEmpty,
  object,
  pipe,
  string,
} from 'valibot';

export const LoginUserSchema = object({
  email: pipe(
    string(),
    nonEmpty('El email es requerido'),
    email('El email no es válido'),
  ),
  password: pipe(string(), nonEmpty('La contraseña es requerida')),
});

export type LoginUserDto = InferInput<typeof LoginUserSchema>;
