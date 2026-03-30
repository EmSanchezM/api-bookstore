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
  type CreateCountryDto,
  CreateCountrySchema,
  type UpdateCountryDto,
  UpdateCountrySchema,
} from '@/modules/countries/application/dtos';
import type {
  CreateCountryUseCase,
  FindAllCountriesUseCase,
  FindByFiltersCountryUseCase,
  FindByIdCountryUseCase,
  FindByIsoCodeCountryUseCase,
  RemoveCountryUseCase,
  UpdateCountryUseCase,
} from '@/modules/countries/application/use-cases';
import type { CountryFilters } from '@/modules/countries/infrastructure/types/country.filters';
import {
  BadRequestException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { validate } from '@/modules/shared/validation/validator-service';

@Controller('/api/v1/countries')
export class CountryController {
  constructor(
    @inject(TYPES.CreateCountryUseCase)
    private createCountryUseCase: CreateCountryUseCase,
    @inject(TYPES.FindAllCountriesUseCase)
    private findAllCountriesUseCase: FindAllCountriesUseCase,
    @inject(TYPES.FindByFiltersCountryUseCase)
    private findByFiltersCountryUseCase: FindByFiltersCountryUseCase,
    @inject(TYPES.FindByIdCountryUseCase)
    private findByIdCountryUseCase: FindByIdCountryUseCase,
    @inject(TYPES.FindByIsoCodeCountryUseCase)
    private findByIsoCodeCountryUseCase: FindByIsoCodeCountryUseCase,
    @inject(TYPES.UpdateCountryUseCase)
    private updateCountryUseCase: UpdateCountryUseCase,
    @inject(TYPES.RemoveCountryUseCase)
    private removeCountryUseCase: RemoveCountryUseCase,
  ) {}

  @UseGuard(TYPES.AuthGuard, TYPES.AdminOrEditorGuard)
  @Post('/')
  async create(@Body() body: unknown): Promise<CreatedHttpResponse> {
    const validationSchema = validate(CreateCountrySchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid country data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const createCountryDto: CreateCountryDto = validationSchema.output;
    const country = await this.createCountryUseCase.execute(createCountryDto);

    return new CreatedHttpResponse(country.properties());
  }

  @Get('/')
  async findAll() {
    const countries = await this.findAllCountriesUseCase.execute();

    if (!countries.length) return [];

    return countries.map((country) => country.properties());
  }

  @Get('/filters')
  async findByFilters(@Query() filters: CountryFilters) {
    const countries = await this.findByFiltersCountryUseCase.execute(filters);

    if (!countries.length)
      throw new NotFoundException(
        `Countries not found with filters: ${JSON.stringify(filters)}`,
      );

    return countries.map((country) => country.properties());
  }

  @Get('/:id')
  async findById(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Country id is required');

    const country = await this.findByIdCountryUseCase.execute(id);

    return country.properties();
  }

  @Get('/iso-code/:isoCode')
  async findByIsoCode(@Params({ name: 'isoCode' }) isoCode: string) {
    if (!isoCode) throw new BadRequestException('Country iso code is required');

    const country = await this.findByIsoCodeCountryUseCase.execute(isoCode);

    return country.properties();
  }

  @UseGuard(TYPES.AuthGuard, TYPES.AdminOrEditorGuard)
  @Put('/:id')
  async update(@Params({ name: 'id' }) id: string, @Body() body: unknown) {
    if (!id) throw new BadRequestException('Country id is required');

    const validationSchema = validate(UpdateCountrySchema, body);
    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid country data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateCountryDto: UpdateCountryDto = validationSchema.output;
    const country = await this.updateCountryUseCase.execute(
      id,
      updateCountryDto,
    );

    return country.properties();
  }

  @UseGuard(TYPES.AuthGuard, TYPES.AdminOrEditorGuard)
  @Delete('/:id')
  async remove(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Country id is required');

    const isRemoved = await this.removeCountryUseCase.execute(id);

    return {
      message: isRemoved ? 'Country deleted successfully' : 'Country not found',
    };
  }
}
