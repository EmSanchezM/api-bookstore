import { partial, type InferInput } from 'valibot';
import { CreateLanguageSchema } from './create-language.dto';

export const UpdateLanguageSchema = partial(CreateLanguageSchema);

export type UpdateLanguageDto = InferInput<typeof UpdateLanguageSchema>;
