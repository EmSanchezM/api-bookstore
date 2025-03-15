export interface CountryEssentials {
  name: string;
  isoCode: string;
  isActive: boolean;
}

export interface CountryOptionals {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CountryUpdate {
  name: string;
  isoCode: string;
}

export type CountryProperties = CountryEssentials & Partial<CountryOptionals>;

export class Country {
  private readonly id: string | undefined;
  private name!: string;
  private isoCode!: string;
  private isActive!: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date | undefined;

  constructor(properties: CountryProperties) {
    if (!properties.id) throw new Error('Country id is required');
    if (!properties.name) throw new Error('Country name is required');
    if (!properties.isoCode) throw new Error('Country isoCode is required');
    if (!properties.isActive) throw new Error('Country isActive is required');

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

  public update(properties: Partial<CountryUpdate>) {
    Object.assign(this, properties);
    this.updatedAt = new Date();
  }
}
