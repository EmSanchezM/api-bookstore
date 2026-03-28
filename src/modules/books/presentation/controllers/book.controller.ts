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
} from '@inversifyjs/http-core';
import { inject } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import {
  type CreateBookDto,
  CreateBookSchema,
  type UpdateBookDto,
  UpdateBookSchema,
} from '@/modules/books/application/dtos';
import type {
  CreateBookUseCase,
  FindAllBooksUseCase,
  FindByFiltersBookUseCase,
  FindByIdBookUseCase,
  RemoveBookUseCase,
  ToggleStatusBookUseCase,
  UpdateBookUseCase,
} from '@/modules/books/application/use-cases';
import type { BookFilters } from '@/modules/books/infrastructure/types/book.filters';
import {
  BadRequestException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { validate } from '@/modules/shared/validation/validator-service';

@Controller('/api/v1/books')
export class BookController {
  constructor(
    @inject(TYPES.CreateBookUseCase)
    private createBookUseCase: CreateBookUseCase,
    @inject(TYPES.FindAllBooksUseCase)
    private findAllBooksUseCase: FindAllBooksUseCase,
    @inject(TYPES.FindByFiltersBookUseCase)
    private findByFiltersBookUseCase: FindByFiltersBookUseCase,
    @inject(TYPES.FindByIdBookUseCase)
    private findByIdBookUseCase: FindByIdBookUseCase,
    @inject(TYPES.RemoveBookUseCase)
    private removeBookUseCase: RemoveBookUseCase,
    @inject(TYPES.ToggleStatusBookUseCase)
    private toggleStatusBookUseCase: ToggleStatusBookUseCase,
    @inject(TYPES.UpdateBookUseCase)
    private updateBookUseCase: UpdateBookUseCase,
  ) {}

  @Post('/')
  async create(@Body() body: unknown): Promise<CreatedHttpResponse> {
    const validationSchema = validate(CreateBookSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid book data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const createBookDto: CreateBookDto = validationSchema.output;
    const book = await this.createBookUseCase.execute(createBookDto);

    return new CreatedHttpResponse(book.properties());
  }

  @Get('/')
  async findAll() {
    const books = await this.findAllBooksUseCase.execute();

    if (!books.length) return [];

    return books.map((book) => book.properties());
  }

  @Get('/filters')
  async findByFilters(@Query() filters: BookFilters) {
    const books = await this.findByFiltersBookUseCase.execute(filters);

    if (!books.length)
      throw new NotFoundException(
        `Books not found with filters: ${JSON.stringify(filters)}`,
      );

    return books.map((book) => book.properties());
  }

  @Get('/:id')
  async findById(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Book id is required');

    const book = await this.findByIdBookUseCase.execute(id);

    return book.properties();
  }

  @Put('/:id')
  async update(@Params({ name: 'id' }) id: string, @Body() body: unknown) {
    if (!id) throw new BadRequestException('Book id is required');

    const validationSchema = validate(UpdateBookSchema, body);
    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid book data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateBookDto: UpdateBookDto = validationSchema.output;
    const book = await this.updateBookUseCase.execute(id, updateBookDto);

    return book.properties();
  }

  @Delete('/:id')
  async remove(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Book id is required');

    const isRemoved = await this.toggleStatusBookUseCase.execute(id);

    return {
      message: isRemoved ? 'Book deleted successfully' : 'Book not found',
    };
  }

  @Delete('/:id/hard-delete')
  async removePermanent(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Book id is required');

    const isRemoved = await this.removeBookUseCase.execute(id);

    return {
      message: isRemoved ? 'Book deleted successfully' : 'Book not found',
    };
  }
}
