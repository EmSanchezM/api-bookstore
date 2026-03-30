import { DatabaseErrorException } from '@/modules/shared/exceptions';

export interface ReadingListEssentials {
  userId: string;
  name: string;
  category: string;
  isPublic: boolean;
  isActive: boolean;
}

export interface ReadingListOptionals {
  id: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingListUpdate {
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
}

export type ReadingListProperties = ReadingListEssentials &
  Partial<ReadingListOptionals>;

export class ReadingList {
  private readonly id: string | undefined;
  private userId!: string;
  private name!: string;
  private description: string | undefined;
  private category!: string;
  private isPublic!: boolean;
  private isActive!: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date | undefined;

  constructor(properties: ReadingListProperties) {
    if (!properties.id)
      throw new DatabaseErrorException('Reading list id is required');
    if (!properties.userId)
      throw new DatabaseErrorException('Reading list userId is required');
    if (!properties.name)
      throw new DatabaseErrorException('Reading list name is required');
    if (!properties.category)
      throw new DatabaseErrorException('Reading list category is required');

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
      userId: this.userId,
      name: this.name,
      description: this.description,
      category: this.category,
      isPublic: this.isPublic,
      isActive: this.isActive,
      createdAt: this.createdAt ?? new Date(),
      updatedAt: this.updatedAt,
    };
  }

  public propertiesToDatabase() {
    return {
      id: this.id,
      user: this.userId,
      name: this.name,
      description: this.description,
      category: this.category,
      is_public: this.isPublic,
      is_active: this.isActive,
    };
  }

  public update(properties: Partial<ReadingListUpdate>) {
    Object.assign(this, properties);
    this.updatedAt = new Date();
  }
}
