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
  type CreateAuthorDto,
  CreateAuthorSchema,
  type UpdateAuthorDto,
  UpdateAuthorSchema,
} from '@/modules/authors/application/dtos';
import type {
  CreateAuthorUseCase,
  FindAllAuthorsUseCase,
  FindByFiltersAuthorUseCase,
  FindByIdAuthorUseCase,
  RemoveAuthorUseCase,
  UpdateAuthorUseCase,
} from '@/modules/authors/application/use-cases';
import type { AuthorFilters } from '@/modules/authors/infrastructure/types/author.filters';
import {
  BadRequestException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { validate } from '@/modules/shared/validation/validator-service';

@Controller('/api/v1/authors')
export class AuthorController {
  constructor(
    @inject(TYPES.CreateAuthorUseCase)
    private createAuthorUseCase: CreateAuthorUseCase,
    @inject(TYPES.FindAllAuthorsUseCase)
    private findAllAuthorsUseCase: FindAllAuthorsUseCase,
    @inject(TYPES.FindByFiltersAuthorUseCase)
    private findByFiltersAuthorUseCase: FindByFiltersAuthorUseCase,
    @inject(TYPES.FindByIdAuthorUseCase)
    private findByIdAuthorUseCase: FindByIdAuthorUseCase,
    @inject(TYPES.RemoveAuthorUseCase)
    private removeAuthorUseCase: RemoveAuthorUseCase,
    @inject(TYPES.UpdateAuthorUseCase)
    private updateAuthorUseCase: UpdateAuthorUseCase,
  ) {}

  @UseGuard(TYPES.AuthGuard, TYPES.AdminOrEditorGuard)
  @Post('/')
  async create(@Body() body: unknown): Promise<CreatedHttpResponse> {
    const validationSchema = validate(CreateAuthorSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid author data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const createAuthorDto: CreateAuthorDto = validationSchema.output;
    const author = await this.createAuthorUseCase.execute(createAuthorDto);

    return new CreatedHttpResponse(author.properties());
  }

  @Get('/')
  async findAll() {
    const authors = await this.findAllAuthorsUseCase.execute();

    if (!authors.length) return [];

    return authors.map((author) => author.properties());
  }

  @Get('/filters')
  async findByFilters(@Query() filters: AuthorFilters) {
    const authors = await this.findByFiltersAuthorUseCase.execute(filters);

    if (!authors.length)
      throw new NotFoundException(
        `Authors not found with filters: ${JSON.stringify(filters)}`,
      );

    return authors.map((author) => author.properties());
  }

  @Get('/:id')
  async findById(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Author id is required');

    const author = await this.findByIdAuthorUseCase.execute(id);

    return author.properties();
  }

  @UseGuard(TYPES.AuthGuard, TYPES.AdminOrEditorGuard)
  @Put('/:id')
  async update(@Params({ name: 'id' }) id: string, @Body() body: unknown) {
    if (!id) throw new BadRequestException('Author id is required');

    const validationSchema = validate(UpdateAuthorSchema, body);
    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid author data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateAuthorDto: UpdateAuthorDto = validationSchema.output;
    const author = await this.updateAuthorUseCase.execute(id, updateAuthorDto);

    return author.properties();
  }

  @UseGuard(TYPES.AuthGuard, TYPES.AdminOrEditorGuard)
  @Delete('/:id')
  async remove(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Author id is required');

    const isRemoved = await this.removeAuthorUseCase.execute(id);

    return {
      message: isRemoved ? 'Author deleted successfully' : 'Author not found',
    };
  }
}
