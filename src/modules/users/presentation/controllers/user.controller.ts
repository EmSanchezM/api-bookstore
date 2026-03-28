import type { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpDelete, httpGet } from 'inversify-express-utils';

import { TYPES } from '@/core/common/constants/types';
import type {
  FindAllUsersUseCase,
  FindByFiltersUserUseCase,
  FindByIdUserUseCase,
  RemoveUserUseCase,
} from '@/modules/users/application/use-cases';
import type { UserFilters } from '@/modules/users/infrastructure/types/user.filters';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@/modules/shared/exceptions';

@controller('/api/v1/users', TYPES.AuthMiddleware)
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

  @httpGet('/')
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.findAllUsersUseCase.execute();

      if (!users.length) return res.status(HttpStatus.OK).json([]);

      res
        .status(HttpStatus.OK)
        .json(users.map((user) => user.propertiesWithoutPassword()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/filters')
  async findByFilters(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query as UserFilters;
      const users = await this.findByFiltersUserUseCase.execute(filters);

      if (!users.length)
        throw new NotFoundException(
          `Users not found with filters: ${JSON.stringify(filters)}`,
        );

      res
        .status(HttpStatus.OK)
        .json(users.map((user) => user.propertiesWithoutPassword()));
    } catch (error) {
      next(error);
    }
  }

  @httpGet('/:id')
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('User id is required');

      const user = await this.findByIdUserUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json(user.propertiesWithoutPassword());
    } catch (error) {
      next(error);
    }
  }

  @httpDelete('/:id')
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.id) throw new BadRequestException('User id is required');

      const isRemoved = await this.removeUserUseCase.execute(req.params.id);

      res.status(HttpStatus.OK).json({
        message: isRemoved ? 'User deleted successfully' : 'User not found',
      });
    } catch (error) {
      next(error);
    }
  }
}
