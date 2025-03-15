import * as v from 'valibot';
import { CreateCountrySchema } from './create-country.dto';

export const UpdateCountrySchema = v.partial(CreateCountrySchema);

export type UpdateCountryDto = v.InferInput<typeof UpdateCountrySchema>;
