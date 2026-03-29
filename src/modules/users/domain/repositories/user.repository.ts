import type { User } from '@/modules/users/domain/entities';
import type { UserFilters } from '@/modules/users/infrastructure/types/user.filters';

export interface UserRepository {
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  getUsersByFilters(filters: UserFilters): Promise<User[]>;
  createUser(user: User): Promise<User | null>;
  updateUser(id: string, user: User): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
}
