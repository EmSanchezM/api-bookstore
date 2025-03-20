import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, httpGet, httpPut, httpDelete } from 'inversify-express-utils';

import { TYPES } from '@/core/common/constants/types';
import { BadRequestException, HttpStatus, NotFoundException } from '@/modules/shared/exceptions';
import { ValidationService } from '@/modules/shared/validation/validator-service';

import {
  CreateLanguageUseCase,
  FindAllLanguagesUseCase,
  FindByFiltersLanguageUseCase,
  FindByIdLanguageUseCase,
  FindByIsoCodeLanguageUseCase,
  RemoveLanguageUseCase,
  UpdateLanguageUseCase,
} from '@/modules/languages/application/use-cases';

import {
  CreateLanguageDto,
  CreateLanguageSchema,
  UpdateLanguageDto,
  UpdateLanguageSchema,
} from '@/modules/languages/application/dtos';

import { LanguageFilters } from '@/modules/languages/infrastructure/types/language.filters';

@controller('/api/v1/languages')
export class LanguageController {
  constructor(
    @inject(TYPES.CreateLanguageUseCase) private createLanguageUseCase: CreateLanguageUseCase,
    @inject(TYPES.FindAllLanguagesUseCase) private findAllLanguagesUseCase: FindAllLanguagesUseCase,
    @inject(TYPES.FindByFiltersLanguageUseCase) private findByFiltersLanguageUseCase: FindByFiltersLanguageUseCase,
    @inject(TYPES.FindByIdLanguageUseCase) private findByIdLanguageUseCase: FindByIdLanguageUseCase,
    @inject(TYPES.FindByIsoCodeLanguageUseCase) private findByIsoCodeLanguageUseCase: FindByIsoCodeLanguageUseCase,
    @inject(TYPES.UpdateLanguageUseCase) private updateLanguageUseCase: UpdateLanguageUseCase,
    @inject(TYPES.RemoveLanguageUseCase) private removeLanguageUseCase: RemoveLanguageUseCase,
  ) {}

  @httpPost('/')
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validationSchema = ValidationService.validate(CreateLanguageSchema, req.body);

      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid language data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const createLanguageDto: CreateLanguageDto = validationSchema.output;
      const language = await this.createLanguageUseCase.execute(createLanguageDto);

      res.status(HttpStatus.CREATED).json(language.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpGet('/')
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const languages = await this.findAllLanguagesUseCase.execute();

      if (!languages.length) return res.status(HttpStatus.OK).json([]);

      res.status(HttpStatus.OK).json(languages.map((language) => language.properties()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/filters')
  async findByFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as LanguageFilters;
      const languages = await this.findByFiltersLanguageUseCase.execute(filters);

      if (!languages.length)
        throw new NotFoundException(`Languages not found with filters: ${JSON.stringify(filters)}`);

      res.status(HttpStatus.OK).json(languages.map((language) => language.properties()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/:id')
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Language id is required');

      const language = await this.findByIdLanguageUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json(language.properties());
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/iso-code/:isoCode')
  async findByIsoCode(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.isoCode) throw new BadRequestException('Language iso code is required');

      const language = await this.findByIsoCodeLanguageUseCase.execute(req.params.isoCode);

      res.status(HttpStatus.OK).json(language.properties());
    } catch (error) {
      next(error);
    }
  }

  @httpPut('/:id')
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Language id is required');

      const validationSchema = ValidationService.validate(UpdateLanguageSchema, req.body);
      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid language data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const updateLanguageDto: UpdateLanguageDto = validationSchema.output;
      const language = await this.updateLanguageUseCase.execute(req.params.id, updateLanguageDto);

      res.status(HttpStatus.OK).json(language.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpDelete('/:id')
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Language id is required');

      const isRemoved = await this.removeLanguageUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json({
        message: isRemoved ? 'Language deleted successfully' : 'Language not found',
      });
    } catch (error) {
      next(error);
    }
  }
}
