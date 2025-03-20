import { DatabaseErrorException } from '@/modules/shared/exceptions';

export interface LanguageEssentials {
  name: string;
  isoCode: string;
  isActive: boolean;
}

export interface LanguageOptionals {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LanguageUpdate {
  name: string;
  isoCode: string;
}

export type LanguageProperties = LanguageEssentials & Partial<LanguageOptionals>;

export class Language {
  private readonly id: string | undefined;
  private name!: string;
  private isoCode!: string;
  private isActive!: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date | undefined;

  constructor(properties: LanguageProperties) {
    if (!properties.id) throw new DatabaseErrorException('Language id is required');
    if (!properties.name) throw new DatabaseErrorException('Language name is required');
    if (!properties.isoCode) throw new DatabaseErrorException('Language isoCode is required');
    if (!properties.isActive) throw new DatabaseErrorException('Language isActive is required');

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
      isoCode: this.isoCode,
      isActive: this.isActive,
      createdAt: this.createdAt ?? new Date(),
      updatedAt: this.updatedAt,
    };
  }

  public propertiesToDatabase() {
    return {
      id: this.id,
      name: this.name,
      iso_code: this.isoCode,
      is_active: this.isActive,
    };
  }

  public update(properties: Partial<LanguageUpdate>) {
    Object.assign(this, properties);
    this.updatedAt = new Date();
  }
}
