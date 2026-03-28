import {
  Body,
  Controller,
  CreatedHttpResponse,
  Get,
  Post,
  Put,
  Request,
  UseGuard,
} from '@inversifyjs/http-core';
import type express from 'express';
import { inject } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { BadRequestException } from '@/modules/shared/exceptions';
import { validate } from '@/modules/shared/validation/validator-service';
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
import type { AuthenticatedRequest } from '@/modules/users/presentation/middlewares/auth.guard';

@Controller('/api/v1/auth')
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

  @Post('/register')
  async register(@Body() body: unknown): Promise<CreatedHttpResponse> {
    const validationSchema = validate(RegisterUserSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid registration data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const registerUserDto: RegisterUserDto = validationSchema.output;
    const user = await this.registerUserUseCase.execute(registerUserDto);

    return new CreatedHttpResponse(user.propertiesWithoutPassword());
  }

  @Post('/login')
  async login(@Body() body: unknown) {
    const validationSchema = validate(LoginUserSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid login data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const loginUserDto: LoginUserDto = validationSchema.output;
    const { token, user } = await this.loginUserUseCase.execute(loginUserDto);

    return { token, user: user.propertiesWithoutPassword() };
  }

  @UseGuard(TYPES.AuthGuard)
  @Get('/me')
  async me(@Request() req: express.Request) {
    const { id } = (req as AuthenticatedRequest).user;
    const user = await this.findByIdUserUseCase.execute(id);

    return user.propertiesWithoutPassword();
  }

  @UseGuard(TYPES.AuthGuard)
  @Put('/me')
  async updateMe(@Request() req: express.Request, @Body() body: unknown) {
    const { id } = (req as AuthenticatedRequest).user;

    const validationSchema = validate(UpdateProfileSchema, body);

    if (!validationSchema.success)
      throw new BadRequestException(
        `Invalid profile data: ${validationSchema.issues.map((issue) => issue.message).join(', ')}`,
      );

    const updateProfileDto: UpdateProfileDto = validationSchema.output;
    const user = await this.updateProfileUseCase.execute(id, updateProfileDto);

    return user.propertiesWithoutPassword();
  }
}
