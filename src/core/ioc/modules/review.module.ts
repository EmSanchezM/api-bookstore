import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  CreateReviewUseCase,
  FindByBookIdReviewUseCase,
  FindByFiltersReviewUseCase,
  FindByIdReviewUseCase,
  FindRepliesByReviewIdUseCase,
  GetBookRatingUseCase,
  RemoveReviewUseCase,
  UpdateReviewUseCase,
} from '@/modules/reviews/application/use-cases';
import { SurrealReviewRepository } from '@/modules/reviews/infrastructure/repositories/surreal-review.repository';

export const reviewModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(TYPES.ReviewRepository).to(SurrealReviewRepository);
    options.bind(TYPES.CreateReviewUseCase).to(CreateReviewUseCase);
    options.bind(TYPES.FindByIdReviewUseCase).to(FindByIdReviewUseCase);
    options.bind(TYPES.FindByBookIdReviewUseCase).to(FindByBookIdReviewUseCase);
    options
      .bind(TYPES.FindRepliesByReviewIdUseCase)
      .to(FindRepliesByReviewIdUseCase);
    options
      .bind(TYPES.FindByFiltersReviewUseCase)
      .to(FindByFiltersReviewUseCase);
    options.bind(TYPES.UpdateReviewUseCase).to(UpdateReviewUseCase);
    options.bind(TYPES.RemoveReviewUseCase).to(RemoveReviewUseCase);
    options.bind(TYPES.GetBookRatingUseCase).to(GetBookRatingUseCase);
  },
);
