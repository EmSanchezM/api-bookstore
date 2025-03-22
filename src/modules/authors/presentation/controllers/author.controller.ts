import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, httpGet, httpPut, httpDelete } from 'inversify-express-utils';

import { TYPES } from '@/core/common/constants/types';
import { BadRequestException, HttpStatus, NotFoundException } from '@/modules/shared/exceptions';
import { ValidationService } from '@/modules/shared/validation/validator-service';

import {
  CreateAuthorUseCase,
  FindAllAuthorsUseCase,
  FindByFiltersAuthorUseCase,
  FindByIdAuthorUseCase,
  RemoveAuthorUseCase,
  UpdateAuthorUseCase,
} from '@/modules/authors/application/use-cases';

import {
  CreateAuthorDto,
  CreateAuthorSchema,
  UpdateAuthorDto,
  UpdateAuthorSchema,
} from '@/modules/authors/application/dtos';

import { AuthorFilters } from '@/modules/authors/infrastructure/types/author.filters';

@controller('/api/v1/authors')
export class AuthorController {
  constructor(
    @inject(TYPES.CreateAuthorUseCase) private createAuthorUseCase: CreateAuthorUseCase,
    @inject(TYPES.FindAllAuthorsUseCase) private findAllAuthorsUseCase: FindAllAuthorsUseCase,
    @inject(TYPES.FindByFiltersAuthorUseCase) private findByFiltersAuthorUseCase: FindByFiltersAuthorUseCase,
    @inject(TYPES.FindByIdAuthorUseCase) private findByIdAuthorUseCase: FindByIdAuthorUseCase,
    @inject(TYPES.RemoveAuthorUseCase) private removeAuthorUseCase: RemoveAuthorUseCase,
    @inject(TYPES.UpdateAuthorUseCase) private updateAuthorUseCase: UpdateAuthorUseCase,
  ) {}

  @httpPost('/')
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validationSchema = ValidationService.validate(CreateAuthorSchema, req.body);

      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid author data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const createAuthorDto: CreateAuthorDto = validationSchema.output;
      const author = await this.createAuthorUseCase.execute(createAuthorDto);

      res.status(HttpStatus.CREATED).json(author.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpGet('/')
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const authors = await this.findAllAuthorsUseCase.execute();

      if (!authors.length) return res.status(HttpStatus.OK).json([]);

      res.status(HttpStatus.OK).json(authors.map((authors) => authors.properties()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/filters')
  async findByFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as AuthorFilters;
      const authors = await this.findByFiltersAuthorUseCase.execute(filters);

      if (!authors.length) throw new NotFoundException(`Authors not found with filters: ${JSON.stringify(filters)}`);

      res.status(HttpStatus.OK).json(authors.map((author) => author.properties()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/:id')
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Author id is required');

      const author = await this.findByIdAuthorUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json(author.properties());
    } catch (error) {
      next(error);
    }
  }

  @httpPut('/:id')
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Author id is required');

      const validationSchema = ValidationService.validate(UpdateAuthorSchema, req.body);
      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid author data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const updateAuthorDto: UpdateAuthorDto = validationSchema.output;
      const author = await this.updateAuthorUseCase.execute(req.params.id, updateAuthorDto);

      res.status(HttpStatus.OK).json(author.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpDelete('/:id')
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Author id is required');

      const isRemoved = await this.removeAuthorUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json({
        message: isRemoved ? 'Author deleted successfully' : 'Author not found',
      });
    } catch (error) {
      next(error);
    }
  }
}
