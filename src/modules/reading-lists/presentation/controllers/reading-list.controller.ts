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
import {
  BadRequestException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { validate } from '@/modules/shared/validation/validator-service';
import {
  type AddBookToListDto,
  AddBookToListSchema,
  type CreateReadingListDto,
  CreateReadingListSchema,
  type UpdateListItemDto,
  UpdateListItemSchema,
  type UpdateReadingListDto,
  UpdateReadingListSchema,
} from '@/modules/reading-lists/application/dtos';
import type {
  AddBookToListUseCase,
  CreateReadingListUseCase,
  FindByFiltersReadingListUseCase,
  FindByIdReadingListUseCase,
  FindByUserIdReadingListUseCase,
  FindPublicReadingListsUseCase,
  GetListItemsUseCase,
  RemoveBookFromListUseCase,
  RemoveReadingListUseCase,
  UpdateListItemUseCase,
  UpdateReadingListUseCase,
} from '@/modules/reading-lists/application/use-cases';
import type { ReadingListFilters } from '@/modules/reading-lists/infrastructure/types/reading-list.filters';
import type { AuthenticatedRequest } from '@/modules/users/presentation/middlewares/auth.guard';

@Controller('/api/v1/reading-lists')
export class ReadingListController {
  constructor(
    @inject(TYPES.CreateReadingListUseCase)
    private createReadingListUseCase: CreateReadingListUseCase,
    @inject(TYPES.FindByIdReadingListUseCase)
    private findByIdReadingListUseCase: FindByIdReadingListUseCase,
    @inject(TYPES.FindByUserIdReadingListUseCase)
    private findByUserIdReadingListUseCase: FindByUserIdReadingListUseCase,
    @inject(TYPES.FindPublicReadingListsUseCase)
    private findPublicReadingListsUseCase: FindPublicReadingListsUseCase,
    @inject(TYPES.FindByFiltersReadingListUseCase)
    private findByFiltersReadingListUseCase: FindByFiltersReadingListUseCase,
    @inject(TYPES.UpdateReadingListUseCase)
    private updateReadingListUseCase: UpdateReadingListUseCase,
    @inject(TYPES.RemoveReadingListUseCase)
    private removeReadingListUseCase: RemoveReadingListUseCase,
    @inject(TYPES.AddBookToListUseCase)
    private addBookToListUseCase: AddBookToListUseCase,
    @inject(TYPES.RemoveBookFromListUseCase)
    private removeBookFromListUseCase: RemoveBookFromListUseCase,
    @inject(TYPES.GetListItemsUseCase)
    private getListItemsUseCase: GetListItemsUseCase,
    @inject(TYPES.UpdateListItemUseCase)
    private updateListItemUseCase: UpdateListItemUseCase,
  ) {}

  @UseGuard(TYPES.AuthGuard)
  @Post('/')
  async create(
    @Request() req: express.Request,
    @Body() body: unknown,
  ): Promise<CreatedHttpResponse> {
    const { id: userId } = (req as AuthenticatedRequest).user;

    const validationSchema = validate(CreateReadingListSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid reading list data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const createReadingListDto: CreateReadingListDto =
      validationSchema.output;
    const readingList = await this.createReadingListUseCase.execute(
      userId,
      createReadingListDto,
    );

    return new CreatedHttpResponse(readingList.properties());
  }

  @Get('/')
  async findPublic() {
    const readingLists = await this.findPublicReadingListsUseCase.execute();

    if (!readingLists.length) return [];

    return readingLists.map((list) => list.properties());
  }

  @Get('/filters')
  async findByFilters(@Query() filters: ReadingListFilters) {
    const readingLists =
      await this.findByFiltersReadingListUseCase.execute(filters);

    if (!readingLists.length)
      throw new NotFoundException(
        `Reading lists not found with filters: ${JSON.stringify(filters)}`,
      );

    return readingLists.map((list) => list.properties());
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/me')
  async findMyLists(@Request() req: express.Request) {
    const { id: userId } = (req as AuthenticatedRequest).user;

    const readingLists =
      await this.findByUserIdReadingListUseCase.execute(userId);

    if (!readingLists.length) return [];

    return readingLists.map((list) => list.properties());
  }

  @Get('/user/:userId')
  async findByUserId(@Params({ name: 'userId' }) userId: string) {
    if (!userId) throw new BadRequestException('User id is required');

    const readingLists =
      await this.findByUserIdReadingListUseCase.execute(userId);

    if (!readingLists.length) return [];

    return readingLists
      .filter((list) => list.properties().isPublic)
      .map((list) => list.properties());
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/:id')
  async findById(
    @Params({ name: 'id' }) id: string,
    @Request() req: express.Request,
  ) {
    if (!id) throw new BadRequestException('Reading list id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;
    const readingList = await this.findByIdReadingListUseCase.execute(
      id,
      userId,
    );

    return readingList.properties();
  }

  @UseGuard(TYPES.AuthGuard)
  @Put('/:id')
  async update(
    @Params({ name: 'id' }) id: string,
    @Request() req: express.Request,
    @Body() body: unknown,
  ) {
    if (!id) throw new BadRequestException('Reading list id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const validationSchema = validate(UpdateReadingListSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid reading list data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateReadingListDto: UpdateReadingListDto =
      validationSchema.output;
    const readingList = await this.updateReadingListUseCase.execute(
      id,
      userId,
      updateReadingListDto,
    );

    return readingList.properties();
  }

  @UseGuard(TYPES.AuthGuard)
  @Delete('/:id')
  async remove(
    @Params({ name: 'id' }) id: string,
    @Request() req: express.Request,
  ) {
    if (!id) throw new BadRequestException('Reading list id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const isRemoved = await this.removeReadingListUseCase.execute(id, userId);

    return {
      message: isRemoved
        ? 'Reading list deleted successfully'
        : 'Reading list not found',
    };
  }

  @UseGuard(TYPES.AuthGuard)
  @Post('/:id/books')
  async addBook(
    @Params({ name: 'id' }) id: string,
    @Request() req: express.Request,
    @Body() body: unknown,
  ): Promise<CreatedHttpResponse> {
    if (!id) throw new BadRequestException('Reading list id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const validationSchema = validate(AddBookToListSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid book data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const addBookToListDto: AddBookToListDto = validationSchema.output;
    const listItem = await this.addBookToListUseCase.execute(
      id,
      userId,
      addBookToListDto,
    );

    return new CreatedHttpResponse(listItem.properties());
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/:id/books')
  async getBooks(
    @Params({ name: 'id' }) id: string,
    @Request() req: express.Request,
  ) {
    if (!id) throw new BadRequestException('Reading list id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;
    const items = await this.getListItemsUseCase.execute(id, userId);

    if (!items.length) return [];

    return items.map((item) => item.properties());
  }

  @UseGuard(TYPES.AuthGuard)
  @Put('/:id/books/:bookId')
  async updateBook(
    @Params({ name: 'id' }) id: string,
    @Params({ name: 'bookId' }) bookId: string,
    @Request() req: express.Request,
    @Body() body: unknown,
  ) {
    if (!id) throw new BadRequestException('Reading list id is required');
    if (!bookId) throw new BadRequestException('Book id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const validationSchema = validate(UpdateListItemSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid list item data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateListItemDto: UpdateListItemDto = validationSchema.output;
    const listItem = await this.updateListItemUseCase.execute(
      id,
      bookId,
      userId,
      updateListItemDto,
    );

    return listItem.properties();
  }

  @UseGuard(TYPES.AuthGuard)
  @Delete('/:id/books/:bookId')
  async removeBook(
    @Params({ name: 'id' }) id: string,
    @Params({ name: 'bookId' }) bookId: string,
    @Request() req: express.Request,
  ) {
    if (!id) throw new BadRequestException('Reading list id is required');
    if (!bookId) throw new BadRequestException('Book id is required');

    const { id: userId } = (req as AuthenticatedRequest).user;

    const isRemoved = await this.removeBookFromListUseCase.execute(
      id,
      bookId,
      userId,
    );

    return {
      message: isRemoved
        ? 'Book removed from list successfully'
        : 'Book not found in list',
    };
  }
}
