import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  GetCollaborativeRecommendationsUseCase,
  GetPersonalRecommendationsUseCase,
  GetPopularByCategoryUseCase,
  GetSimilarBooksUseCase,
  GetTrendingUseCase,
} from '@/modules/recommendations/application/use-cases';
import { SurrealRecommendationRepository } from '@/modules/recommendations/infrastructure/repositories/surreal-recommendation.repository';

export const recommendationModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind(TYPES.RecommendationRepository)
      .to(SurrealRecommendationRepository);
    options
      .bind(TYPES.GetCollaborativeRecommendationsUseCase)
      .to(GetCollaborativeRecommendationsUseCase);
    options
      .bind(TYPES.GetPersonalRecommendationsUseCase)
      .to(GetPersonalRecommendationsUseCase);
    options
      .bind(TYPES.GetPopularByCategoryUseCase)
      .to(GetPopularByCategoryUseCase);
    options.bind(TYPES.GetTrendingUseCase).to(GetTrendingUseCase);
    options.bind(TYPES.GetSimilarBooksUseCase).to(GetSimilarBooksUseCase);
  },
);
