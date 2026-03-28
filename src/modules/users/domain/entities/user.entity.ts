import { DatabaseErrorException } from '@/modules/shared/exceptions';

export interface UserEssentials {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
}

export interface UserOptionals {
  id: string;
  avatar: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdate {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  bio: string;
}

export type UserProperties = UserEssentials & Partial<UserOptionals>;

export class User {
  private readonly id: string | undefined;
  private firstName!: string;
  private lastName!: string;
  private email!: string;
  private passwordHash!: string;
  private avatar: string | undefined;
  private bio: string | undefined;
  private isActive!: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date | undefined;

  constructor(properties: UserProperties) {
    if (!properties.id) throw new DatabaseErrorException('User id is required');
    if (!properties.firstName)
      throw new DatabaseErrorException('User first name is required');
    if (!properties.lastName)
      throw new DatabaseErrorException('User last name is required');
    if (!properties.email)
      throw new DatabaseErrorException('User email is required');
    if (!properties.passwordHash)
      throw new DatabaseErrorException('User password hash is required');

    Object.assign(this, properties);

    if (properties.createdAt) {
      this.createdAt = properties.createdAt;
    } else {
      this.createdAt = new Date();
    }
  }

  public properties() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      passwordHash: this.passwordHash,
      avatar: this.avatar,
      bio: this.bio,
      isActive: this.isActive,
      createdAt: this.createdAt ?? new Date(),
      updatedAt: this.updatedAt,
    };
  }

  public propertiesWithoutPassword() {
    const { passwordHash, ...props } = this.properties();
    return props;
  }

  public propertiesToDatabase() {
    return {
      id: this.id,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password_hash: this.passwordHash,
      avatar: this.avatar,
      bio: this.bio,
      is_active: this.isActive,
    };
  }

  public update(properties: Partial<UserUpdate>) {
    Object.assign(this, properties);
    this.updatedAt = new Date();
  }
}
