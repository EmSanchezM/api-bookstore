import {
  pipe,
  string,
  object,
  nonEmpty,
  minLength,
  maxLength,
  url,
  array,
  startsWith,
  regex,
  type InferInput,
} from 'valibot';

export const CreateAuthorSchema = object({
  firstName: pipe(
    string(),
    nonEmpty('El nombre es requerido'),
    minLength(2, 'El nombre debe tener al menos 2 caracteres'),
    maxLength(50, 'El nombre debe tener máximo 50 caracteres'),
    regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'El nombre solo puede contener letras y espacios'),
  ),
  lastName: pipe(
    string(),
    nonEmpty('El apellido es requerido'),
    minLength(2, 'El apellido debe tener al menos 2 caracteres'),
    maxLength(50, 'El apellido debe tener máximo 50 caracteres'),
    regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'El apellido solo puede contener letras y espacios'),
  ),
  nationality: pipe(
    string(),
    nonEmpty('La nacionalidad es requerida'),
    minLength(2, 'La nacionalidad debe tener al menos 2 caracteres'),
    maxLength(50, 'La nacionalidad debe tener máximo 50 caracteres'),
  ),
  biography: pipe(
    string(),
    nonEmpty('La biografía es requerida'),
    minLength(10, 'La biografía debe tener al menos 10 caracteres'),
    maxLength(2000, 'La biografía debe tener máximo 2000 caracteres'),
  ),
  awards: pipe(
    array(
      pipe(
        string(),
        nonEmpty('El premio no puede estar vacío'),
        minLength(2, 'El premio debe tener al menos 2 caracteres'),
      ),
    ),
  ),
  genres: pipe(
    array(
      pipe(
        string(),
        nonEmpty('El género no puede estar vacío'),
        minLength(2, 'El género debe tener al menos 2 caracteres'),
      ),
    ),
  ),
  notableWorks: pipe(
    array(
      pipe(
        string(),
        nonEmpty('La obra no puede estar vacía'),
        minLength(2, 'La obra debe tener al menos 2 caracteres'),
      ),
    ),
  ),
  socialLinks: object({
    facebook: pipe(string(), startsWith('https://facebook.com/', 'Debe ser una URL válida de Facebook')),
    twitter: pipe(string(), startsWith('https://twitter.com/', 'Debe ser una URL válida de Twitter')),
    instagram: pipe(string(), startsWith('https://instagram.com/', 'Debe ser una URL válida de Instagram')),
  }),
  website: pipe(string(), url('La URL del sitio web no es válida')),
  birthDate: pipe(
    string(),
    nonEmpty('La fecha de nacimiento es requerida'),
    regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD'),
  ),
  dateOfDeath: pipe(string(), regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato YYYY-MM-DD')),
});

export type CreateAuthorDto = InferInput<typeof CreateAuthorSchema>;
