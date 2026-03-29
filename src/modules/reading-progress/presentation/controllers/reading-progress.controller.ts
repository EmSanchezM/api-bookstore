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
  type StartReadingDto,
  StartReadingSchema,
  type UpdateProgressDto,
  UpdateProgressSchema,
} from '@/modules/reading-progress/application/dtos';
import type {
  FindByFiltersProgressUseCase,
  FindByIdProgressUseCase,
  FindByUserAndBookProgressUseCase,
  FindByUserIdProgressUseCase,
  GetUserStatsUseCase,
  RemoveProgressUseCase,
  StartReadingUseCase,
  UpdateProgressUseCase,
} from '@/modules/reading-progress/application/use-cases';
import type { ReadingProgressFilters } from '@/modules/reading-progress/infrastructure/types/reading-progress.filters';
import type { AuthenticatedRequest } from '@/modules/users/presentation/middlewares/auth.guard';

@Controller('/api/v1/reading-progress')
export class ReadingProgressController {
  constructor(
    @inject(TYPES.StartReadingUseCase)
    private startReadingUseCase: StartReadingUseCase,
    @inject(TYPES.FindByIdProgressUseCase)
    private findByIdProgressUseCase: FindByIdProgressUseCase,
    @inject(TYPES.FindByUserAndBookProgressUseCase)
    private findByUserAndBookProgressUseCase: FindByUserAndBookProgressUseCase,
    @inject(TYPES.FindByUserIdProgressUseCase)
    private findByUserIdProgressUseCase: FindByUserIdProgressUseCase,
    @inject(TYPES.FindByFiltersProgressUseCase)
    private findByFiltersProgressUseCase: FindByFiltersProgressUseCase,
    @inject(TYPES.UpdateProgressUseCase)
    private updateProgressUseCase: UpdateProgressUseCase,
    @inject(TYPES.RemoveProgressUseCase)
    private removeProgressUseCase: RemoveProgressUseCase,
    @inject(TYPES.GetUserStatsUseCase)
    private getUserStatsUseCase: GetUserStatsUseCase,
  ) {}

  @UseGuard(TYPES.AuthGuard)
  @Post('/')
  async create(
    @Request() req: express.Request,
    @Body() body: unknown,
  ): Promise<CreatedHttpResponse> {
    const { id: userId } = (req as AuthenticatedRequest).user;

    const validationSchema = validate(StartReadingSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid reading progress data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const startReadingDto: StartReadingDto = validationSchema.output;
    const progress = await this.startReadingUseCase.execute(
      userId,
      startReadingDto,
    );

    return new CreatedHttpResponse(progress.properties());
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/me')
  async findMyProgress(@Request() req: express.Request) {
    const { id: userId } = (req as AuthenticatedRequest).user;

    const progressList =
      await this.findByUserIdProgressUseCase.execute(userId);

    if (!progressList.length) return [];

    return progressList.map((p) => p.properties());
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/me/stats')
  async getMyStats(@Request() req: express.Request) {
    const { id: userId } = (req as AuthenticatedRequest).user;

    return this.getUserStatsUseCase.execute(userId);
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/filters')
  async findByFilters(@Query() filters: ReadingProgressFilters) {
    const progressList =
      await this.findByFiltersProgressUseCase.execute(filters);

    if (!progressList.length) return [];

    return progressList.map((p) => p.properties());
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/:id')
  async findById(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Reading progress id is required');

    const progress = await this.findByIdProgressUseCase.execute(id);

    return progress.properties();
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/book/:bookId')
  async findByBook(
    @Params({ name: 'bookId' }) bookId: string,
    @Request() req: express.Request,
  ) {
    if (!bookId) throw new BadRequestException('Book id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const progress =
      await this.findByUserAndBookProgressUseCase.execute(userId, bookId);

    return progress.properties();
  }

  @UseGuard(TYPES.AuthGuard)
  @Put('/:id')
  async update(
    @Params({ name: 'id' }) id: string,
    @Request() req: express.Request,
    @Body() body: unknown,
  ) {
    if (!id) throw new BadRequestException('Reading progress id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const validationSchema = validate(UpdateProgressSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid reading progress data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateProgressDto: UpdateProgressDto = validationSchema.output;
    const progress = await this.updateProgressUseCase.execute(
      id,
      userId,
      updateProgressDto,
    );

    return progress.properties();
  }

  @UseGuard(TYPES.AuthGuard)
  @Delete('/:id')
  async remove(
    @Params({ name: 'id' }) id: string,
    @Request() req: express.Request,
  ) {
    if (!id) throw new BadRequestException('Reading progress id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const isRemoved = await this.removeProgressUseCase.execute(id, userId);

    return {
      message: isRemoved
        ? 'Reading progress deleted successfully'
        : 'Reading progress not found',
    };
  }
}
