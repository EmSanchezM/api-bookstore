import { Router, Request, Response } from 'express';

import { Database } from '@/core/database';

import { SurrealCountryRepository } from '@/modules/countries/infrastructure/repositories/surreal-country.repository';
import {
  CreateCountryUseCase,
  UpdateCountryUseCase,
  FindAllCountriesUseCase,
  FindByIdCountryUseCase,
  FindByIsoCodeCountryUseCase,
  RemoveCountryUseCase,
} from '@/modules/countries/application/use-cases';

import { CountryController } from '@/modules/countries/presentation/controllers/country.controller';

export class CountryRoutes {
  private router: Router = Router();

  constructor(private readonly controller: CountryController) {
    this.mountRoutes();
  }

  private mountRoutes(): void {
    this.router.post('/', this.controller.create);
  }

  public getRouter(): Router {
    return this.router;
  }
}

export class CountryRoutesFactory {
  constructor(private readonly database: Database) {}

  async create(): Promise<CountryRoutes> {
    const connection = await this.database.getConnection();
    const countryRepository = new SurrealCountryRepository(connection);

    const createCountryUseCase = new CreateCountryUseCase(countryRepository);
    const updateCountryUseCase = new UpdateCountryUseCase(countryRepository);
    const findCountriesUseCase = new FindAllCountriesUseCase(countryRepository);
    const findCountryByIdUseCase = new FindByIdCountryUseCase(countryRepository);
    const findCountryByIsoCodeUseCase = new FindByIsoCodeCountryUseCase(countryRepository);
    const removeCountryUseCase = new RemoveCountryUseCase(countryRepository);

    const countryController = new CountryController(
      createCountryUseCase,
      findCountriesUseCase,
      findCountryByIdUseCase,
      findCountryByIsoCodeUseCase,
      updateCountryUseCase,
      removeCountryUseCase,
    );

    return new CountryRoutes(countryController);
  }
}

export async function getCountryRouter(): Promise<Router> {
  const factory = new CountryRoutesFactory(Database.getInstance());
  const routes = await factory.create();
  return routes.getRouter();
}
