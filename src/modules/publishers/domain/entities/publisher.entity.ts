import { DatabaseErrorException } from '@/modules/shared/exceptions';

export interface PublisherEssentials {
  name: string;
  website: string;
  isActive: boolean;
}

export interface PublisherOptionals {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublisherUpdate {
  name: string;
  website: string;
}

export type PublisherProperties = PublisherEssentials & Partial<PublisherOptionals>;

export class Publisher {
  private readonly id: string | undefined;
  private name!: string;
  private website!: string;
  private isActive!: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date | undefined;

  constructor(properties: PublisherProperties) {
    if (!properties.id) throw new DatabaseErrorException('Publisher id is required');
    if (!properties.name) throw new DatabaseErrorException('Publisher name is required');
    if (!properties.website) throw new DatabaseErrorException('Publisher isoCode is required');
    if (!properties.isActive) throw new DatabaseErrorException('Publisher isActive is required');

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
      name: this.name,
      website: this.website,
      isActive: this.isActive,
      createdAt: this.createdAt ?? new Date(),
      updatedAt: this.updatedAt,
    };
  }

  public propertiesToDatabase() {
    return {
      id: this.id,
      name: this.name,
      website: this.website,
      is_active: this.isActive,
    };
  }

  public update(properties: Partial<PublisherUpdate>) {
    Object.assign(this, properties);
    this.updatedAt = new Date();
  }
}
