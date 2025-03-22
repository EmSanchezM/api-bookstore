import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, httpGet, httpPut, httpDelete } from 'inversify-express-utils';

import { TYPES } from '@/core/common/constants/types';
import { BadRequestException, HttpStatus, NotFoundException } from '@/modules/shared/exceptions';
import { ValidationService } from '@/modules/shared/validation/validator-service';

import {
  CreateBookUseCase,
  FindAllBooksUseCase,
  FindByFiltersBookUseCase,
  FindByIdBookUseCase,
  RemoveBookUseCase,
  UpdateBookUseCase,
} from '@/modules/books/application/use-cases';

import {
  CreateBookDto,
  CreateBookSchema,
  UpdateBookDto,
  UpdateBookSchema,
} from '@/modules/books/application/dtos';

import { BookFilters } from '@/modules/books/infrastructure/types/book.filters';

@controller('/api/v1/books')
export class BookController {
  constructor(
    @inject(TYPES.CreateBookUseCase) private createBookUseCase: CreateBookUseCase,
    @inject(TYPES.FindAllBooksUseCase) private findAllBooksUseCase: FindAllBooksUseCase,
    @inject(TYPES.FindByFiltersBookUseCase) private findByFiltersBookUseCase: FindByFiltersBookUseCase,
    @inject(TYPES.FindByIdBookUseCase) private findByIdBookUseCase: FindByIdBookUseCase,
    @inject(TYPES.RemoveBookUseCase) private removeBookUseCase: RemoveBookUseCase,
    @inject(TYPES.UpdateBookUseCase) private updateBookUseCase: UpdateBookUseCase,
  ) {}

  @httpPost('/')
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validationSchema = ValidationService.validate(CreateBookSchema, req.body);

      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid book data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const createBookDto: CreateBookDto = validationSchema.output;
      const book = await this.createBookUseCase.execute(createBookDto);

      res.status(HttpStatus.CREATED).json(book.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpGet('/')
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const books = await this.findAllBooksUseCase.execute();

      if (!books.length) return res.status(HttpStatus.OK).json([]);

      res.status(HttpStatus.OK).json(books.map(book => book.properties()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/filters')
  async findByFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as BookFilters;
      const books = await this.findByFiltersBookUseCase.execute(filters);

      if (!books.length)
        throw new NotFoundException(`Books not found with filters: ${JSON.stringify(filters)}`);

      res.status(HttpStatus.OK).json(books.map(book => book.properties()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/:id')
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Book id is required');

      const book = await this.findByIdBookUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json(book.properties());
    } catch (error) {
      next(error);
    }
  }

  @httpPut('/:id')
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Book id is required');

      const validationSchema = ValidationService.validate(UpdateBookSchema, req.body);
      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid book data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const updateBookDto: UpdateBookDto = validationSchema.output;
      const book = await this.updateBookUseCase.execute(req.params.id, updateBookDto);

      res.status(HttpStatus.OK).json(book.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpDelete('/:id')
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Book id is required');

      const isRemoved = await this.removeBookUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json({
        message: isRemoved ? 'Book deleted successfully' : 'Book not found',
      });
    } catch (error) {
      next(error);
    }
  }
}
