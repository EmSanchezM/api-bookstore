import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, httpGet, httpPut, httpDelete } from 'inversify-express-utils';
import { TYPES } from '@/core/common/constants/types';
import { BadRequestException, HttpException, HttpStatus, InternalServerErrorException } from '@/modules/shared/exceptions';
import { ValidationService } from '@/modules/shared/application/validation/validator-service';

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
  async create(req: Request, res: Response) {
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
      if (error instanceof BadRequestException) throw error;

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  @httpGet('/')
  async findAll() {
    const countries = await this.findAllCountriesUseCase.execute();
    return countries.map((country) => country.properties());
  }

  @httpGet('/:id')
  async findById(req: Request, res: Response) {
    if (!req.params.id) throw new BadRequestException('Country id is required');

    const country = await this.findByIdCountryUseCase.execute(req.params.id);

    res.status(HttpStatus.OK).json(country.properties());
  }

  @httpGet('/:isoCode')
  async findByIsoCode(req: Request, res: Response) {
    if (!req.params.isoCode) throw new BadRequestException('Country iso code is required');

    const country = await this.findByIsoCodeCountryUseCase.execute(req.params.isoCode);

    res.status(HttpStatus.OK).json(country.properties());
  }

  @httpPut('/:id')
  async update(req: Request, res: Response) {
    if (!req.params.id) throw new BadRequestException('Country id is required');

    const validationSchema = ValidationService.validate(UpdateCountrySchema, req.body);
    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid country data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateCountryDto: UpdateCountryDto = validationSchema.output;
    const country = await this.updateCountryUseCase.execute(req.params.id, updateCountryDto);

    res.status(HttpStatus.OK).json(country.properties());
  }

  @httpDelete('/:id')
  async remove(req: Request, res: Response) {
    if (!req.params.id) throw new BadRequestException('Country id is required');

    const isRemoved = await this.removeCountryUseCase.execute(req.params.id);

    res.status(HttpStatus.OK).json({
      message: isRemoved ? 'Country deleted successfully' : 'Country not found',
    });
  }
}
