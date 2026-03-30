import { type InferInput, partial } from 'valibot';
import { CreateReadingListSchema } from './create-reading-list.dto';

export const UpdateReadingListSchema = partial(CreateReadingListSchema);

export type UpdateReadingListDto = InferInput<typeof UpdateReadingListSchema>;
