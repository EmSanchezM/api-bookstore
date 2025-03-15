import { partial, type InferInput } from 'valibot';
import { CreateCountrySchema } from './create-country.dto';

export const UpdateCountrySchema = partial(CreateCountrySchema);

export type UpdateCountryDto = InferInput<typeof UpdateCountrySchema>;
