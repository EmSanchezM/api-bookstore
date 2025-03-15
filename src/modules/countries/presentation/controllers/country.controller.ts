import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, httpGet, httpPut, httpDelete, next } from 'inversify-express-utils';
import { TYPES } from '@/core/common/constants/types';
import { BadRequestException, HttpStatus } from '@/modules/shared/exceptions';
import { ValidationService } from '@/modules/shared/validation/validator-service';

import {
  CreateCountryUseCase,
  FindAllCountriesUseCase,
  FindByIdCountryUseCase,
  FindByIsoCodeCountryUseCase,
  RemoveCountryUseCase,
  UpdateCountryUseCase,
} from '@/modules/countries/application/use-cases';

import {
  CreateCountryDto,
  CreateCountrySchema,
  UpdateCountryDto,
  UpdateCountrySchema,
} from '@/modules/countries/application/dtos';

@controller('/api/v1/countries')
export class CountryController {
  constructor(
    @inject(TYPES.CreateCountryUseCase) private createCountryUseCase: CreateCountryUseCase,
    @inject(TYPES.FindAllCountriesUseCase) private findAllCountriesUseCase: FindAllCountriesUseCase,
    @inject(TYPES.FindByIdCountryUseCase) private findByIdCountryUseCase: FindByIdCountryUseCase,
    @inject(TYPES.FindByIsoCodeCountryUseCase) private findByIsoCodeCountryUseCase: FindByIsoCodeCountryUseCase,
    @inject(TYPES.UpdateCountryUseCase) private updateCountryUseCase: UpdateCountryUseCase,
    @inject(TYPES.RemoveCountryUseCase) private removeCountryUseCase: RemoveCountryUseCase,
  ) {}

  @httpPost('/')
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validationSchema = ValidationService.validate(CreateCountrySchema, req.body);

      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid country data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const createCountryDto: CreateCountryDto = validationSchema.output;
      const country = await this.createCountryUseCase.execute(createCountryDto);

      res.status(HttpStatus.CREATED).json(country.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpGet('/')
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const countries = await this.findAllCountriesUseCase.execute();

      res.status(HttpStatus.OK).json(countries.map((country) => country.properties()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/:id')
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Country id is required');

      const country = await this.findByIdCountryUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json(country.properties());
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/iso-code/:isoCode')
  async findByIsoCode(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.isoCode) throw new BadRequestException('Country iso code is required');

      const country = await this.findByIsoCodeCountryUseCase.execute(req.params.isoCode);

      res.status(HttpStatus.OK).json(country.properties());
    } catch (error) {
      next(error);
    }
  }

  @httpPut('/:id')
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Country id is required');

      const validationSchema = ValidationService.validate(UpdateCountrySchema, req.body);
      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid country data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const updateCountryDto: UpdateCountryDto = validationSchema.output;
      const country = await this.updateCountryUseCase.execute(req.params.id, updateCountryDto);

      res.status(HttpStatus.OK).json(country.properties());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpDelete('/:id')
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('Country id is required');

      const isRemoved = await this.removeCountryUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json({
        message: isRemoved ? 'Country deleted successfully' : 'Country not found',
      });
    } catch (error) {
      next(error);
    }
  }
}
