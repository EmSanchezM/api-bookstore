import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import {
  Argon2PasswordHasher,
  JoseTokenProvider,
} from '@/modules/shared/security';
import {
  FindAllUsersUseCase,
  FindByFiltersUserUseCase,
  FindByIdUserUseCase,
  LoginUserUseCase,
  RegisterUserUseCase,
  RemoveUserUseCase,
  UpdateProfileUseCase,
} from '@/modules/users/application/use-cases';
import { SurrealUserRepository } from '@/modules/users/infrastructure/repositories/surreal-user.repository';
import { AuthGuard } from '@/modules/users/presentation/middlewares/auth.guard';

export const userModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(TYPES.PasswordHasher).to(Argon2PasswordHasher);
    options.bind(TYPES.TokenProvider).to(JoseTokenProvider);
    options.bind(TYPES.AuthGuard).to(AuthGuard);
    options.bind(TYPES.UserRepository).to(SurrealUserRepository);
    options.bind(TYPES.RegisterUserUseCase).to(RegisterUserUseCase);
    options.bind(TYPES.LoginUserUseCase).to(LoginUserUseCase);
    options.bind(TYPES.FindByIdUserUseCase).to(FindByIdUserUseCase);
    options.bind(TYPES.FindAllUsersUseCase).to(FindAllUsersUseCase);
    options.bind(TYPES.FindByFiltersUserUseCase).to(FindByFiltersUserUseCase);
    options.bind(TYPES.UpdateProfileUseCase).to(UpdateProfileUseCase);
    options.bind(TYPES.RemoveUserUseCase).to(RemoveUserUseCase);
  },
);
