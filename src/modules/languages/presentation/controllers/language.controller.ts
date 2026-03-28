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
  type CreateLanguageDto,
  CreateLanguageSchema,
  type UpdateLanguageDto,
  UpdateLanguageSchema,
} from '@/modules/languages/application/dtos';
import type {
  CreateLanguageUseCase,
  FindAllLanguagesUseCase,
  FindByFiltersLanguageUseCase,
  FindByIdLanguageUseCase,
  FindByIsoCodeLanguageUseCase,
  RemoveLanguageUseCase,
  UpdateLanguageUseCase,
} from '@/modules/languages/application/use-cases';
import type { LanguageFilters } from '@/modules/languages/infrastructure/types/language.filters';
import {
  BadRequestException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import { validate } from '@/modules/shared/validation/validator-service';

@Controller('/api/v1/languages')
export class LanguageController {
  constructor(
    @inject(TYPES.CreateLanguageUseCase)
    private createLanguageUseCase: CreateLanguageUseCase,
    @inject(TYPES.FindAllLanguagesUseCase)
    private findAllLanguagesUseCase: FindAllLanguagesUseCase,
    @inject(TYPES.FindByFiltersLanguageUseCase)
    private findByFiltersLanguageUseCase: FindByFiltersLanguageUseCase,
    @inject(TYPES.FindByIdLanguageUseCase)
    private findByIdLanguageUseCase: FindByIdLanguageUseCase,
    @inject(TYPES.FindByIsoCodeLanguageUseCase)
    private findByIsoCodeLanguageUseCase: FindByIsoCodeLanguageUseCase,
    @inject(TYPES.UpdateLanguageUseCase)
    private updateLanguageUseCase: UpdateLanguageUseCase,
    @inject(TYPES.RemoveLanguageUseCase)
    private removeLanguageUseCase: RemoveLanguageUseCase,
  ) {}

  @Post('/')
  async create(@Body() body: unknown): Promise<CreatedHttpResponse> {
    const validationSchema = validate(CreateLanguageSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid language data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const createLanguageDto: CreateLanguageDto = validationSchema.output;
    const language =
      await this.createLanguageUseCase.execute(createLanguageDto);

    return new CreatedHttpResponse(language.properties());
  }

  @Get('/')
  async findAll() {
    const languages = await this.findAllLanguagesUseCase.execute();

    if (!languages.length) return [];

    return languages.map((language) => language.properties());
  }

  @Get('/filters')
  async findByFilters(@Query() filters: LanguageFilters) {
    const languages = await this.findByFiltersLanguageUseCase.execute(filters);

    if (!languages.length)
      throw new NotFoundException(
        `Languages not found with filters: ${JSON.stringify(filters)}`,
      );

    return languages.map((language) => language.properties());
  }

  @Get('/:id')
  async findById(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Language id is required');

    const language = await this.findByIdLanguageUseCase.execute(id);

    return language.properties();
  }

  @Get('/iso-code/:isoCode')
  async findByIsoCode(@Params({ name: 'isoCode' }) isoCode: string) {
    if (!isoCode)
      throw new BadRequestException('Language iso code is required');

    const language = await this.findByIsoCodeLanguageUseCase.execute(isoCode);

    return language.properties();
  }

  @Put('/:id')
  async update(@Params({ name: 'id' }) id: string, @Body() body: unknown) {
    if (!id) throw new BadRequestException('Language id is required');

    const validationSchema = validate(UpdateLanguageSchema, body);
    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid language data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateLanguageDto: UpdateLanguageDto = validationSchema.output;
    const language = await this.updateLanguageUseCase.execute(
      id,
      updateLanguageDto,
    );

    return language.properties();
  }

  @Delete('/:id')
  async remove(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('Language id is required');

    const isRemoved = await this.removeLanguageUseCase.execute(id);

    return {
      message: isRemoved
        ? 'Language deleted successfully'
        : 'Language not found',
    };
  }
}
