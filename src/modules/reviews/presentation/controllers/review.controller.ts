import {
  Body,
  Controller,
  CreatedHttpResponse,
  Delete,
  Get,
  Params,
  Post,
  Put,
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
  type CreateReviewDto,
  CreateReviewSchema,
  type UpdateReviewDto,
  UpdateReviewSchema,
} from '@/modules/reviews/application/dtos';
import type {
  CreateReviewUseCase,
  FindByBookIdReviewUseCase,
  FindByFiltersReviewUseCase,
  FindByIdReviewUseCase,
  FindRepliesByReviewIdUseCase,
  GetBookRatingUseCase,
  RemoveReviewUseCase,
  UpdateReviewUseCase,
} from '@/modules/reviews/application/use-cases';
import type { ReviewFilters } from '@/modules/reviews/infrastructure/types/review.filters';
import type { AuthenticatedRequest } from '@/modules/users/presentation/middlewares/auth.guard';

@Controller('/api/v1/reviews')
export class ReviewController {
  constructor(
    @inject(TYPES.CreateReviewUseCase)
    private createReviewUseCase: CreateReviewUseCase,
    @inject(TYPES.FindByIdReviewUseCase)
    private findByIdReviewUseCase: FindByIdReviewUseCase,
    @inject(TYPES.FindByBookIdReviewUseCase)
    private findByBookIdReviewUseCase: FindByBookIdReviewUseCase,
    @inject(TYPES.FindRepliesByReviewIdUseCase)
    private findRepliesByReviewIdUseCase: FindRepliesByReviewIdUseCase,
    @inject(TYPES.FindByFiltersReviewUseCase)
    private findByFiltersReviewUseCase: FindByFiltersReviewUseCase,
    @inject(TYPES.UpdateReviewUseCase)
    private updateReviewUseCase: UpdateReviewUseCase,
    @inject(TYPES.RemoveReviewUseCase)
    private removeReviewUseCase: RemoveReviewUseCase,
    @inject(TYPES.GetBookRatingUseCase)
    private getBookRatingUseCase: GetBookRatingUseCase,
  ) {}

  @UseGuard(TYPES.AuthGuard)
  @Post('/')
  async create(
    @Request() req: express.Request,
    @Body() body: unknown,
  ): Promise<CreatedHttpResponse> {
    const { id: userId } = (req as AuthenticatedRequest).user;

    const validationSchema = validate(CreateReviewSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid review data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const createReviewDto: CreateReviewDto = validationSchema.output;
    const review = await this.createReviewUseCase.execute(
      userId,
      createReviewDto,
    );

    return new CreatedHttpResponse(review.properties());
  }

  @Get('/filters')
  async findByFilters(@Query() filters: ReviewFilters) {
    const reviews = await this.findByFiltersReviewUseCase.execute(filters);

    if (!reviews.length) return [];

    return reviews.map((r) => r.properties());
  }

  @Get('/book/:bookId/rating')
  async getBookRating(@Params({ name: 'bookId' }) bookId: string) {
    if (!bookId) throw new BadRequestException('Book id is required');

    return this.getBookRatingUseCase.execute(bookId);
  }

  @Get('/book/:bookId')
  async findByBookId(@Params({ name: 'bookId' }) bookId: string) {
    if (!bookId) throw new BadRequestException('Book id is required');

    const reviews = await this.findByBookIdReviewUseCase.execute(bookId);

    if (!reviews.length) return [];

    return reviews.map((r) => r.properties());
  }

  @Get('/user/:userId')
  async findByUserId(@Params({ name: 'userId' }) userId: string) {
    if (!userId) throw new BadRequestException('User id is required');

    const reviews =
      await this.findByFiltersReviewUseCase.execute({ userId });

    if (!reviews.length) return [];

    return reviews.map((r) => r.properties());
  }

  @Get('/:id/replies')
  async findReplies(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Review id is required');

    const replies = await this.findRepliesByReviewIdUseCase.execute(id);

    if (!replies.length) return [];

    return replies.map((r) => r.properties());
  }

  @Get('/:id')
  async findById(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Review id is required');

    const review = await this.findByIdReviewUseCase.execute(id);

    return review.properties();
  }

  @UseGuard(TYPES.AuthGuard)
  @Put('/:id')
  async update(
    @Params({ name: 'id' }) id: string,
    @Request() req: express.Request,
    @Body() body: unknown,
  ) {
    if (!id) throw new BadRequestException('Review id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const validationSchema = validate(UpdateReviewSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid review data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateReviewDto: UpdateReviewDto = validationSchema.output;
    const review = await this.updateReviewUseCase.execute(
      id,
      userId,
      updateReviewDto,
    );

    return review.properties();
  }

  @UseGuard(TYPES.AuthGuard)
  @Delete('/:id')
  async remove(
    @Params({ name: 'id' }) id: string,
    @Request() req: express.Request,
  ) {
    if (!id) throw new BadRequestException('Review id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const isRemoved = await this.removeReviewUseCase.execute(id, userId);

    return {
      message: isRemoved
        ? 'Review deleted successfully'
        : 'Review not found',
    };
  }
}
