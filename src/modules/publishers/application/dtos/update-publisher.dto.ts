import { type InferInput, partial } from 'valibot';
import { CreatePublisherSchema } from './create-publisher.dto';

export const UpdatePublisherSchema = partial(CreatePublisherSchema);

export type UpdatePublisherDto = InferInput<typeof UpdatePublisherSchema>;
