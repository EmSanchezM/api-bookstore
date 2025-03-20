import { partial, type InferInput } from 'valibot';
import { CreateAuthorSchema } from './create-author.dto';

export const UpdateAuthorSchema = partial(CreateAuthorSchema);

export type UpdateAuthorDto = InferInput<typeof UpdateAuthorSchema>;
