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
  UseGuard,
} from '@inversifyjs/http-core';
import { inject } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import {
  type CreatePublisherDto,
  CreatePublisherSchema,
  type UpdatePublisherDto,
  UpdatePublisherSchema,
} from '@/modules/publishers/application/dtos';
import type {
  CreatePublisherUseCase,
  FindAllPublishersUseCase,
  FindByFiltersPublisherUseCase,
  FindByIdPublisherUseCase,
  RemovePublisherUseCase,
  UpdatePublisherUseCase,
} from '@/modules/publishers/application/use-cases';
import type { PublisherFilters } from '@/modules/publishers/infrastructure/types/publisher.filters';
import {
  BadRequestException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { validate } from '@/modules/shared/validation/validator-service';

@Controller('/api/v1/publishers')
export class PublisherController {
  constructor(
    @inject(TYPES.CreatePublisherUseCase)
    private createPublisherUseCase: CreatePublisherUseCase,
    @inject(TYPES.FindAllPublishersUseCase)
    private findAllPublishersUseCase: FindAllPublishersUseCase,
    @inject(TYPES.FindByFiltersPublisherUseCase)
    private findByFiltersPublisherUseCase: FindByFiltersPublisherUseCase,
    @inject(TYPES.FindByIdPublisherUseCase)
    private findByIdPublisherUseCase: FindByIdPublisherUseCase,
    @inject(TYPES.RemovePublisherUseCase)
    private removePublisherUseCase: RemovePublisherUseCase,
    @inject(TYPES.UpdatePublisherUseCase)
    private updatePublisherUseCase: UpdatePublisherUseCase,
  ) {}

  @UseGuard(TYPES.AuthGuard, TYPES.AdminOrEditorGuard)
  @Post('/')
  async create(@Body() body: unknown): Promise<CreatedHttpResponse> {
    const validationSchema = validate(CreatePublisherSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid publisher data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const createPublisherDto: CreatePublisherDto = validationSchema.output;
    const publisher =
      await this.createPublisherUseCase.execute(createPublisherDto);

    return new CreatedHttpResponse(publisher.properties());
  }

  @Get('/')
  async findAll() {
    const publishers = await this.findAllPublishersUseCase.execute();

    if (!publishers.length) return [];

    return publishers.map((publisher) => publisher.properties());
  }

  @Get('/filters')
  async findByFilters(@Query() filters: PublisherFilters) {
    const publishers =
      await this.findByFiltersPublisherUseCase.execute(filters);

    if (!publishers.length)
      throw new NotFoundException(
        `Publishers not found with filters: ${JSON.stringify(filters)}`,
      );

    return publishers.map((publisher) => publisher.properties());
  }

  @Get('/:id')
  async findById(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Publisher id is required');

    const publisher = await this.findByIdPublisherUseCase.execute(id);

    return publisher.properties();
  }

  @UseGuard(TYPES.AuthGuard, TYPES.AdminOrEditorGuard)
  @Put('/:id')
  async update(@Params({ name: 'id' }) id: string, @Body() body: unknown) {
    if (!id) throw new BadRequestException('Publisher id is required');

    const validationSchema = validate(UpdatePublisherSchema, body);
    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid publisher data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updatePublisherDto: UpdatePublisherDto = validationSchema.output;
    const publisher = await this.updatePublisherUseCase.execute(
      id,
      updatePublisherDto,
    );

    return publisher.properties();
  }

  @UseGuard(TYPES.AuthGuard, TYPES.AdminOrEditorGuard)
  @Delete('/:id')
  async remove(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Publisher id is required');

    const isRemoved = await this.removePublisherUseCase.execute(id);

    return {
      message: isRemoved
        ? 'Publisher deleted successfully'
        : 'Publisher not found',
    };
  }
}
