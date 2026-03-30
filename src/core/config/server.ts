import 'reflect-metadata';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import { TYPES } from '@/core/common/constants/types';
import { loadContainer } from '@/core/ioc/container';
import type { SeedAdminUseCase } from '@/modules/users/application/use-cases';
import { AuthorController } from '@/modules/authors/presentation/controllers/author.controller';
import { BookController } from '@/modules/books/presentation/controllers/book.controller';
import { CountryController } from '@/modules/countries/presentation/controllers/country.controller';
import { LanguageController } from '@/modules/languages/presentation/controllers/language.controller';
import { PublisherController } from '@/modules/publishers/presentation/controllers/publisher.controller';
import { ReadingListController } from '@/modules/reading-lists/presentation/controllers/reading-list.controller';
import { ReadingProgressController } from '@/modules/reading-progress/presentation/controllers/reading-progress.controller';
import { RecommendationController } from '@/modules/recommendations/presentation/controllers/recommendation.controller';
import { ReviewController } from '@/modules/reviews/presentation/controllers/review.controller';
import { GlobalErrorFilter } from '@/modules/shared/middlewares/error-handlers';
import { AuthController } from '@/modules/users/presentation/controllers/auth.controller';
import { UserController } from '@/modules/users/presentation/controllers/user.controller';
import { database } from '../database';
import { logger } from './logger';

export const createServer = async () => {
  try {
    dotenv.config();

    await database.getConnection();

    if (!database.isConnected()) {
      logger.error(' 🚫 Failed to connect to database');
      process.exit(1);
    }

    const container = await loadContainer();

    container.bind(AuthorController).toSelf().inSingletonScope();
    container.bind(BookController).toSelf().inSingletonScope();
    container.bind(CountryController).toSelf().inSingletonScope();
    container.bind(LanguageController).toSelf().inSingletonScope();
    container.bind(PublisherController).toSelf().inSingletonScope();
    container.bind(ReadingListController).toSelf().inSingletonScope();
    container.bind(ReadingProgressController).toSelf().inSingletonScope();
    container.bind(RecommendationController).toSelf().inSingletonScope();
    container.bind(ReviewController).toSelf().inSingletonScope();
    container.bind(AuthController).toSelf().inSingletonScope();
    container.bind(UserController).toSelf().inSingletonScope();

    const seedAdmin =
      container.get<SeedAdminUseCase>(TYPES.SeedAdminUseCase);
    await seedAdmin.execute();

    const adapter = new InversifyExpressHttpAdapter(container);
    adapter.useGlobalFilters(GlobalErrorFilter);

    const app = await adapter.build();

    app.use(json());
    app.use(urlencoded({ extended: true }));
    app.use(cors());

    return app;
  } catch (error) {
    logger.error('Failed to create server:', error);
    throw error;
  }
};
