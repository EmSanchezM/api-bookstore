import { Request, Response } from 'express';

import {
  CreateCountryUseCase,
  FindAllCountriesUseCase,
  FindByIdCountryUseCase,
  FindByIsoCodeCountryUseCase,
  UpdateCountryUseCase,
  RemoveCountryUseCase,
} from '@/modules/countries/application/use-cases';
import {
  CreateCountrySchema,
  UpdateCountrySchema,
  CreateCountryDto,
  UpdateCountryDto,
} from '@/modules/countries/application/dtos';

import { ValidationService } from '@/modules/shared/application/validation/validator-service';

export class CountryController {
  constructor(
    private readonly createCountryUseCase: CreateCountryUseCase,
    private readonly findCountriesUseCase: FindAllCountriesUseCase,
    private readonly findCountryByIdUseCase: FindByIdCountryUseCase,
    private readonly findCountryByIsoCodeUseCase: FindByIsoCodeCountryUseCase,
    private readonly updateCountryUseCase: UpdateCountryUseCase,
    private readonly removeCountryUseCase: RemoveCountryUseCase,
  ) {
    this.create = this.create.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.findByIsoCode = this.findByIsoCode.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  async create(req: Request, res: Response) {
    try {
      const validationSchema = ValidationService.validate(CreateCountrySchema, req.body);

      if (!validationSchema.success)
        throw new Error(`Invalid country data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`);

      const createCountryDto: CreateCountryDto = validationSchema.output;
      const country = await this.createCountryUseCase.execute(createCountryDto);

      res.status(201).json(country.properties());
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const countries = await this.findCountriesUseCase.execute();
      res.status(200).json(countries.map((country) => country.properties()));
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const country = await this.findCountryByIdUseCase.execute(req.params.id);
      res.status(200).json(country.properties());
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async findByIsoCode(req: Request, res: Response) {
    try {
      const country = await this.findCountryByIsoCodeUseCase.execute(req.params.isoCode);
      res.status(200).json(country.properties());
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) throw new Error('Country id is required');

      const validationSchema = ValidationService.validate(UpdateCountrySchema, req.body);

      if (!validationSchema.success)
        throw new Error(`Invalid country data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`);

      const updateCountryDto: UpdateCountryDto = validationSchema.output;

      const country = await this.updateCountryUseCase.execute(id, updateCountryDto);
      res.status(200).json(country.properties());
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) throw new Error('Country id is required');

      const country = await this.findCountryByIdUseCase.execute(id);

      if (!country) throw new Error('Country not found');

      const isRemoved = await this.removeCountryUseCase.execute(id);

      res.status(200).json({
        message: isRemoved ? 'Country deleted successfully' : 'Country not found',
      });
    } catch (error) {
      return res.status(400).json({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
