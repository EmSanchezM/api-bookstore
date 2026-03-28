import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  CreatePublisherUseCase,
  FindAllPublishersUseCase,
  FindByFiltersPublisherUseCase,
  FindByIdPublisherUseCase,
  RemovePublisherUseCase,
  UpdatePublisherUseCase,
} from '@/modules/publishers/application/use-cases';
import { SurrealPublisherRepository } from '@/modules/publishers/infrastructure/repositories/surreal-publisher.repository';

export const publisherModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(TYPES.PublisherRepository).to(SurrealPublisherRepository);
    options.bind(TYPES.CreatePublisherUseCase).to(CreatePublisherUseCase);
    options.bind(TYPES.UpdatePublisherUseCase).to(UpdatePublisherUseCase);
    options.bind(TYPES.FindAllPublishersUseCase).to(FindAllPublishersUseCase);
    options
      .bind(TYPES.FindByFiltersPublisherUseCase)
      .to(FindByFiltersPublisherUseCase);
    options.bind(TYPES.FindByIdPublisherUseCase).to(FindByIdPublisherUseCase);
    options.bind(TYPES.RemovePublisherUseCase).to(RemovePublisherUseCase);
  },
);
