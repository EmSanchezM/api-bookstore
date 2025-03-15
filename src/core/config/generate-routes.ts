import { Express } from 'express';
import { getCountryRouter } from '@/modules/countries/presentation/routes';

export const generateRoutes = async (server: Express) => {
  //Country routes
  const countryRouter = await getCountryRouter();
  server.use('/api/v1/countries', countryRouter);
};
