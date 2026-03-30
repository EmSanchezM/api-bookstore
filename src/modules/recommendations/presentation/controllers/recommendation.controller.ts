import {
  Controller,
  Get,
  Params,
  Query,
  Request,
  UseGuard,
} from '@inversifyjs/http-core';
import type express from 'express';
import { inject } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { BadRequestException } from '@/modules/shared/exceptions';
import { validate } from '@/modules/shared/validation/validator-service';
import {
  RecommendationQuerySchema,
  TrendingQuerySchema,
} from '@/modules/recommendations/application/dtos';
import type {
  GetCollaborativeRecommendationsUseCase,
  GetPersonalRecommendationsUseCase,
  GetPopularByCategoryUseCase,
  GetSimilarBooksUseCase,
  GetTrendingUseCase,
} from '@/modules/recommendations/application/use-cases';
import type { AuthenticatedRequest } from '@/modules/users/presentation/middlewares/auth.guard';

@Controller('/api/v1/recommendations')
export class RecommendationController {
  constructor(
    @inject(TYPES.GetCollaborativeRecommendationsUseCase)
    private getCollaborativeUseCase: GetCollaborativeRecommendationsUseCase,
    @inject(TYPES.GetPersonalRecommendationsUseCase)
    private getPersonalUseCase: GetPersonalRecommendationsUseCase,
    @inject(TYPES.GetPopularByCategoryUseCase)
    private getPopularByCategoryUseCase: GetPopularByCategoryUseCase,
    @inject(TYPES.GetTrendingUseCase)
    private getTrendingUseCase: GetTrendingUseCase,
    @inject(TYPES.GetSimilarBooksUseCase)
    private getSimilarBooksUseCase: GetSimilarBooksUseCase,
  ) {}

  @UseGuard(TYPES.AuthGuard)
  @Get('/personal')
  async getPersonal(
    @Request() req: express.Request,
    @Query() query: unknown,
  ) {
    const { id: userId } = (req as AuthenticatedRequest).user;

    const validation = validate(RecommendationQuerySchema, query);
    if (!validation.success)
      throw new BadRequestException(
        `Invalid query params: ${validation.issues.map((i) => i.message).join(', ')}`,
      );

    const limit = validation.output.limit ?? 10;
    return this.getPersonalUseCase.execute(userId, limit);
  }

  @Get('/book/:bookId/similar')
  async getCollaborative(
    @Params({ name: 'bookId' }) bookId: string,
    @Query() query: unknown,
  ) {
    if (!bookId) throw new BadRequestException('Book id is required');

    const validation = validate(RecommendationQuerySchema, query);
    if (!validation.success)
      throw new BadRequestException(
        `Invalid query params: ${validation.issues.map((i) => i.message).join(', ')}`,
      );

    const limit = validation.output.limit ?? 10;
    return this.getCollaborativeUseCase.execute(bookId, limit);
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/book/:bookId/because-you-read')
  async getSimilarBooks(
    @Params({ name: 'bookId' }) bookId: string,
    @Request() req: express.Request,
    @Query() query: unknown,
  ) {
    if (!bookId) throw new BadRequestException('Book id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const validation = validate(RecommendationQuerySchema, query);
    if (!validation.success)
      throw new BadRequestException(
        `Invalid query params: ${validation.issues.map((i) => i.message).join(', ')}`,
      );

    const limit = validation.output.limit ?? 10;
    return this.getSimilarBooksUseCase.execute(userId, bookId, limit);
  }

  @Get('/category/:category')
  async getPopularByCategory(
    @Params({ name: 'category' }) category: string,
    @Query() query: unknown,
  ) {
    if (!category) throw new BadRequestException('Category is required');

    const validation = validate(RecommendationQuerySchema, query);
    if (!validation.success)
      throw new BadRequestException(
        `Invalid query params: ${validation.issues.map((i) => i.message).join(', ')}`,
      );

    const limit = validation.output.limit ?? 10;
    return this.getPopularByCategoryUseCase.execute(category, limit);
  }

  @Get('/trending')
  async getTrending(@Query() query: unknown) {
    const validation = validate(TrendingQuerySchema, query);
    if (!validation.success)
      throw new BadRequestException(
        `Invalid query params: ${validation.issues.map((i) => i.message).join(', ')}`,
      );

    const limit = validation.output.limit ?? 10;
    const days = validation.output.days ?? 30;
    return this.getTrendingUseCase.execute(limit, days);
  }
}
