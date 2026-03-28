import { ContainerModule } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
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
import { AuthMiddleware } from '@/modules/users/presentation/middlewares/auth.middleware';
import {
  Argon2PasswordHasher,
  JoseTokenProvider,
} from '@/modules/shared/security';

export const userModule = new ContainerModule((bind) => {
  bind(TYPES.PasswordHasher).to(Argon2PasswordHasher);
  bind(TYPES.TokenProvider).to(JoseTokenProvider);
  bind(TYPES.AuthMiddleware).to(AuthMiddleware);
  bind(TYPES.UserRepository).to(SurrealUserRepository);
  bind(TYPES.RegisterUserUseCase).to(RegisterUserUseCase);
  bind(TYPES.LoginUserUseCase).to(LoginUserUseCase);
  bind(TYPES.FindByIdUserUseCase).to(FindByIdUserUseCase);
  bind(TYPES.FindAllUsersUseCase).to(FindAllUsersUseCase);
  bind(TYPES.FindByFiltersUserUseCase).to(FindByFiltersUserUseCase);
  bind(TYPES.UpdateProfileUseCase).to(UpdateProfileUseCase);
  bind(TYPES.RemoveUserUseCase).to(RemoveUserUseCase);
});
