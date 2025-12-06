import { type InferInput, partial } from 'valibot';
import { CreateBookSchema } from './create-book.dto';

export const UpdateBookSchema = partial(CreateBookSchema);

export type UpdateBookDto = InferInput<typeof UpdateBookSchema>;
