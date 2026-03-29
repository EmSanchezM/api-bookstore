import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  FindByFiltersProgressUseCase,
  FindByIdProgressUseCase,
  FindByUserAndBookProgressUseCase,
  FindByUserIdProgressUseCase,
  GetUserStatsUseCase,
  RemoveProgressUseCase,
  StartReadingUseCase,
  UpdateProgressUseCase,
} from '@/modules/reading-progress/application/use-cases';
import { SurrealReadingProgressRepository } from '@/modules/reading-progress/infrastructure/repositories/surreal-reading-progress.repository';

export const readingProgressModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind(TYPES.ReadingProgressRepository)
      .to(SurrealReadingProgressRepository);
    options.bind(TYPES.StartReadingUseCase).to(StartReadingUseCase);
    options.bind(TYPES.FindByIdProgressUseCase).to(FindByIdProgressUseCase);
    options
      .bind(TYPES.FindByUserAndBookProgressUseCase)
      .to(FindByUserAndBookProgressUseCase);
    options
      .bind(TYPES.FindByUserIdProgressUseCase)
      .to(FindByUserIdProgressUseCase);
    options
      .bind(TYPES.FindByFiltersProgressUseCase)
      .to(FindByFiltersProgressUseCase);
    options.bind(TYPES.UpdateProgressUseCase).to(UpdateProgressUseCase);
    options.bind(TYPES.RemoveProgressUseCase).to(RemoveProgressUseCase);
    options.bind(TYPES.GetUserStatsUseCase).to(GetUserStatsUseCase);
  },
);
