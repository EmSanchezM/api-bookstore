import { ContainerModule } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import { SurrealPublisherRepository } from '@/modules/publishers/infrastructure/repositories/surreal-publisher.repository';
import {
  CreatePublisherUseCase,
  FindAllPublishersUseCase,
  FindByFiltersPublisherUseCase,
  FindByIdPublisherUseCase,
  RemovePublisherUseCase,
  UpdatePublisherUseCase,
} from '@/modules/publishers/application/use-cases';

export const publisherModule = new ContainerModule((bind) => {
  bind(TYPES.PublisherRepository).to(SurrealPublisherRepository);
  bind(TYPES.CreatePublisherUseCase).to(CreatePublisherUseCase);
  bind(TYPES.UpdatePublisherUseCase).to(UpdatePublisherUseCase);
  bind(TYPES.FindAllPublishersUseCase).to(FindAllPublishersUseCase);
  bind(TYPES.FindByFiltersPublisherUseCase).to(FindByFiltersPublisherUseCase);
  bind(TYPES.FindByIdPublisherUseCase).to(FindByIdPublisherUseCase);
  bind(TYPES.RemovePublisherUseCase).to(RemovePublisherUseCase);
});
