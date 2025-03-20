import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, httpGet, httpPut, httpDelete } from 'inversify-express-utils';

import { TYPES } from '@/core/common/constants/types';
import { BadRequestException, HttpStatus, NotFoundException } from '@/modules/shared/exceptions';
import { ValidationService } from '@/modules/shared/validation/validator-service';

import {
  CreatePublisherUseCase,
  FindAllPublishersUseCase,
  FindByFiltersPublisherUseCase,
  FindByIdPublisherUseCase,
  RemovePublisherUseCase,
  UpdatePublisherUseCase,
} from '@/modules/publishers/application/use-cases';

import {
  CreatePublisherDto,
  CreatePublisherSchema,
  UpdatePublisherDto,
  UpdatePublisherSchema,
} from '@/modules/publishers/application/dtos';

import { PublisherFilters } from '@/modules/publishers/infrastructure/types/publisher.filters';

@controller('/api/v1/publishers')
export class PublisherController {
  constructor(
    @inject(TYPES.CreatePublisherUseCase) private createPublisherUseCase: CreatePublisherUseCase,
    @inject(TYPES.FindAllPublishersUseCase) private findAllPublishersUseCase: FindAllPublishersUseCase,
    @inject(TYPES.FindByFiltersPublisherUseCase) private findByFiltersPublisherUseCase: FindByFiltersPublisherUseCase,
    @inject(TYPES.FindByIdPublisherUseCase) private findByIdPublisherUseCase: FindByIdPublisherUseCase,
    @inject(TYPES.RemovePublisherUseCase) private removePublisherUseCase: RemovePublisherUseCase,
    @inject(TYPES.UpdatePublisherUseCase) private updatePublisherUseCase: UpdatePublisherUseCase,
  ) {}

  @httpPost('/')
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validationSchema = ValidationService.validate(CreatePublisherSchema, req.body);

      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid publisher data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const createPublisherDto: CreatePublisherDto = validationSchema.output;
      const publisher = await this.createPublisherUseCase.execute(createPublisherDto);

      res.status(HttpStatus.CREATED).json(publisher.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpGet('/')
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const publishers = await this.findAllPublishersUseCase.execute();

      if (!publishers.length) return res.status(HttpStatus.OK).json([]);

      res.status(HttpStatus.OK).json(publishers.map((publisher) => publisher.properties()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/filters')
  async findByFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as PublisherFilters;
      const publishers = await this.findByFiltersPublisherUseCase.execute(filters);

      if (!publishers.length)
        throw new NotFoundException(`Publishers not found with filters: ${JSON.stringify(filters)}`);

      res.status(HttpStatus.OK).json(publishers.map((publisher) => publisher.properties()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/:id')
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Publisher id is required');

      const publisher = await this.findByIdPublisherUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json(publisher.properties());
    } catch (error) {
      next(error);
    }
  }

  @httpPut('/:id')
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Publisher id is required');

      const validationSchema = ValidationService.validate(UpdatePublisherSchema, req.body);
      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid publisher data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const updatePublisherDto: UpdatePublisherDto = validationSchema.output;
      const publisher = await this.updatePublisherUseCase.execute(req.params.id, updatePublisherDto);

      res.status(HttpStatus.OK).json(publisher.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpDelete('/:id')
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Publisher id is required');

      const isRemoved = await this.removePublisherUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json({
        message: isRemoved ? 'Publisher deleted successfully' : 'Publisher not found',
      });
    } catch (error) {
      next(error);
    }
  }
}
