import {
  Controller,
  Delete,
  Get,
  Params,
  Query,
  UseGuard,
} from '@inversifyjs/http-core';
import { inject } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import {
  BadRequestException,
  NotFoundException,
} from '@/modules/shared/exceptions';
import type {
  FindAllUsersUseCase,
  FindByFiltersUserUseCase,
  FindByIdUserUseCase,
  RemoveUserUseCase,
} from '@/modules/users/application/use-cases';
import type { UserFilters } from '@/modules/users/infrastructure/types/user.filters';

@UseGuard(TYPES.AuthGuard)
@Controller('/api/v1/users')
export class UserController {
  constructor(
    @inject(TYPES.FindAllUsersUseCase)
    private findAllUsersUseCase: FindAllUsersUseCase,
    @inject(TYPES.FindByFiltersUserUseCase)
    private findByFiltersUserUseCase: FindByFiltersUserUseCase,
    @inject(TYPES.FindByIdUserUseCase)
    private findByIdUserUseCase: FindByIdUserUseCase,
    @inject(TYPES.RemoveUserUseCase)
    private removeUserUseCase: RemoveUserUseCase,
  ) {}

  @Get('/')
  async findAll() {
    const users = await this.findAllUsersUseCase.execute();

    if (!users.length) return [];

    return users.map((user) => user.propertiesWithoutPassword());
  }

  @Get('/filters')
  async findByFilters(@Query() filters: UserFilters) {
    const users = await this.findByFiltersUserUseCase.execute(filters);

    if (!users.length)
      throw new NotFoundException(
        `Users not found with filters: ${JSON.stringify(filters)}`,
      );

    return users.map((user) => user.propertiesWithoutPassword());
  }

  @Get('/:id')
  async findById(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('User id is required');

    const user = await this.findByIdUserUseCase.execute(id);

    return user.propertiesWithoutPassword();
  }

  @Delete('/:id')
  async remove(@Params({ name: 'id' }) id: string) {
    if (!id) throw new BadRequestException('User id is required');

    const isRemoved = await this.removeUserUseCase.execute(id);

    return {
      message: isRemoved ? 'User deleted successfully' : 'User not found',
    };
  }
}
