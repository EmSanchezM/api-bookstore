import type { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
} from 'inversify-express-utils';

import { TYPES } from '@/core/common/constants/types';
import {
  type LoginUserDto,
  LoginUserSchema,
  type RegisterUserDto,
  RegisterUserSchema,
  type UpdateProfileDto,
  UpdateProfileSchema,
} from '@/modules/users/application/dtos';
import type {
  FindByIdUserUseCase,
  LoginUserUseCase,
  RegisterUserUseCase,
  UpdateProfileUseCase,
} from '@/modules/users/application/use-cases';
import { BadRequestException, HttpStatus } from '@/modules/shared/exceptions';
import { ValidationService } from '@/modules/shared/validation/validator-service';
import type { AuthenticatedRequest } from '@/modules/users/presentation/middlewares/auth.middleware';

@controller('/api/v1/auth')
export class AuthController {
  constructor(
    @inject(TYPES.RegisterUserUseCase)
    private registerUserUseCase: RegisterUserUseCase,
    @inject(TYPES.LoginUserUseCase)
    private loginUserUseCase: LoginUserUseCase,
    @inject(TYPES.FindByIdUserUseCase)
    private findByIdUserUseCase: FindByIdUserUseCase,
    @inject(TYPES.UpdateProfileUseCase)
    private updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @httpPost('/register')
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validationSchema = ValidationService.validate(
        RegisterUserSchema,
        req.body,
      );

      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid registration data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const registerUserDto: RegisterUserDto = validationSchema.output;
      const user = await this.registerUserUseCase.execute(registerUserDto);

      res.status(HttpStatus.CREATED).json(user.propertiesWithoutPassword());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpPost('/login')
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validationSchema = ValidationService.validate(
        LoginUserSchema,
        req.body,
      );

      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid login data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const loginUserDto: LoginUserDto = validationSchema.output;
      const { token, user } = await this.loginUserUseCase.execute(loginUserDto);

      res.status(HttpStatus.OK).json({
        token,
        user: user.propertiesWithoutPassword(),
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpGet('/me', TYPES.AuthMiddleware)
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = (req as AuthenticatedRequest).user;
      const user = await this.findByIdUserUseCase.execute(id);

      res.status(HttpStatus.OK).json(user.propertiesWithoutPassword());
    } catch (error: unknown) {
      next(error);
    }
  }

  @httpPut('/me', TYPES.AuthMiddleware)
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = (req as AuthenticatedRequest).user;

      const validationSchema = ValidationService.validate(
        UpdateProfileSchema,
        req.body,
      );

      if (!validationSchema.success)
        throw new BadRequestException(
          `Invalid profile data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
        );

      const updateProfileDto: UpdateProfileDto = validationSchema.output;
      const user = await this.updateProfileUseCase.execute(
        id,
        updateProfileDto,
      );

      res.status(HttpStatus.OK).json(user.propertiesWithoutPassword());
    } catch (error: unknown) {
      next(error);
    }
  }
}
