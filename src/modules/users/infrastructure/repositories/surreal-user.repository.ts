import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type Surreal from 'surrealdb';
import { type RecordId, ResponseError } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { User } from '@/modules/users/domain/entities';
import type { UserRepository } from '@/modules/users/domain/repositories';
import type { UserFilters } from '@/modules/users/infrastructure/types/user.filters';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { SurrealRecordIdMapper } from '@/modules/shared/mappers';

interface UserRecord {
  id: RecordId | string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  avatar: string | undefined;
  bio: string | undefined;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: unknown;
}

@injectable()
export class SurrealUserRepository implements UserRepository {
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getUserById(id: string): Promise<User | null> {
    try {
      const userRecordId = SurrealRecordIdMapper.toRecordId('user', id);

      const userRecord = await this.db.select<UserRecord>(userRecordId);

      if (!userRecord) return null;

      return this.mapToUser(userRecord);
    } catch (error) {
      this.handleError(error, 'getUserById');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const [response] = await this.db.query<UserRecord[]>(
        'SELECT * FROM user WHERE email = $email LIMIT 1',
        { email },
      );

      if (!response?.length) return null;

      return this.mapToUser(response[0]);
    } catch (error) {
      this.handleError(error, 'getUserByEmail');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.db.select<UserRecord>('user');

      if (!response?.length) return [];

      return response.map((user: UserRecord) => this.mapToUser(user));
    } catch (error) {
      this.handleError(error, 'getAllUsers');
    }
  }

  criteriaToQuery(filters: UserFilters) {
    const params: {
      is_active?: boolean;
      name?: string;
      email?: string;
      skip?: number;
      limit?: number;
    } = {};
    const conditions: string[] = [];
    let query = 'SELECT * FROM user';

    if (filters.isActive !== undefined) {
      conditions.push('is_active = $is_active');
      params.is_active = filters.isActive;
    }

    if (filters.name) {
      conditions.push(
        '(string::contains(string::lowercase(first_name), string::lowercase($name)) OR string::contains(string::lowercase(last_name), string::lowercase($name)))',
      );
      params.name = filters.name;
    }

    if (filters.email) {
      conditions.push(
        'string::contains(string::lowercase(email), string::lowercase($email))',
      );
      params.email = filters.email;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const orderBy = filters.orderBy ?? 'created_at';
    const sortBy = filters.sortBy ?? 'desc';
    query += ` ORDER BY ${orderBy} ${sortBy}`;

    if (filters.skip && filters.limit) {
      query += ` LIMIT ${filters.limit} START ${filters.skip}`;
    }

    return {
      query,
      params,
    };
  }

  async getUsersByFilters(filters: UserFilters): Promise<User[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<UserRecord[]>(query, params);

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((user: UserRecord) => this.mapToUser(user));
    } catch (error) {
      this.handleError(error, 'getUsersByFilters');
    }
  }

  async createUser(user: User): Promise<User | null> {
    try {
      const properties = user.propertiesToDatabase();
      const userRecordId = SurrealRecordIdMapper.toRecordId(
        'user',
        properties.id!,
      );

      const newUserRecord = await this.db.create(userRecordId, properties);

      if (!newUserRecord) return null;

      return this.mapToUser(newUserRecord);
    } catch (error) {
      this.handleError(error, 'createUser');
    }
  }

  async updateUser(id: string, user: User): Promise<User | null> {
    try {
      const userRecordId = SurrealRecordIdMapper.toRecordId('user', id);
      const properties = user.properties();

      const payload: Partial<UserRecord> = {
        first_name: properties.firstName,
        last_name: properties.lastName,
        email: properties.email,
        avatar: properties.avatar,
        bio: properties.bio,
        is_active: properties.isActive,
        created_at: properties.createdAt,
        updated_at: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const updatedUserRecord = await this.db.update(userRecordId, payload);

      if (!updatedUserRecord) return null;

      return this.mapToUser(updatedUserRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updateUser');
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const userRecordId = SurrealRecordIdMapper.toRecordId('user', id);
      const removedUserRecord = await this.db.delete<UserRecord>(userRecordId);

      if (!removedUserRecord) return false;

      return removedUserRecord.id ? true : false;
    } catch (error: unknown) {
      this.handleError(error, 'deleteUser');
    }
  }

  private handleError(error: unknown, methodName: string): never {
    logger.error(`Error ${methodName}:`, error);
    if (error instanceof ResponseError) {
      throw new DatabaseErrorException({
        description: error.message,
        cause: error.stack,
      });
    }
    throw new DatabaseErrorException(error);
  }

  private mapToUser(record: any): User {
    return new User({
      id: SurrealRecordIdMapper.fromRecordId(record.id),
      firstName: record.first_name,
      lastName: record.last_name,
      email: record.email,
      passwordHash: record.password_hash,
      avatar: record.avatar,
      bio: record.bio,
      isActive: record.is_active,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    });
  }
}
