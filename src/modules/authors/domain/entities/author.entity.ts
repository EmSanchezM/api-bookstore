import { DatabaseErrorException } from '@/modules/shared/exceptions';

export interface AuthorEssentials {
  firstName: string;
  lastName: string;
  nationality: string;
  birthDate: Date;
  isActive: boolean;
}

export type SocialLinks = Partial<{
  facebook: string;
  twitter: string;
  instagram: string;
}>;

export interface AuthorOptionals {
  id: string;
  biography: string;
  awards: string[];
  genres: string[];
  notableWorks: string[];
  website: string;
  socialLinks: SocialLinks;
  dateOfDeath: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthorUpdate {
  firstName: string;
  lastName: string;
  nationality: string;
  biography: string;
  awards: string[];
  genres: string[];
  notableWorks: string[];
  website: string;
  socialLinks: SocialLinks;
  birthDate: Date;
  dateOfDeath: Date;
}

export type AuthorProperties = AuthorEssentials & Partial<AuthorOptionals>;

export class Author {
  private readonly id: string | undefined;
  private firstName!: string;
  private lastName!: string;
  private nationality!: string;
  private birthDate!: Date;
  private dateOfDeath: Date | undefined;
  private biography: string | undefined;
  private awards: string[] | undefined;
  private genres: string[] | undefined;
  private notableWorks: string[] | undefined;
  private website: string | undefined;
  private socialLinks: SocialLinks | undefined;
  private isActive!: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date | undefined;

  constructor(properties: AuthorProperties) {
    if (!properties.id) throw new DatabaseErrorException('Author id is required');
    if (!properties.firstName) throw new DatabaseErrorException('Author name is required');
    if (!properties.lastName) throw new DatabaseErrorException('Author last name is required');
    if (!properties.nationality) throw new DatabaseErrorException('Author nationality is required');
    if (!properties.birthDate) throw new DatabaseErrorException('Author birth date is required');
    if (!properties.isActive) throw new DatabaseErrorException('Author isActive is required');

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
      nationality: this.nationality,
      biography: this.biography,
      awards: this.awards,
      genres: this.genres,
      notableWorks: this.notableWorks,
      website: this.website,
      socialLinks: this.socialLinks,
      birthDate: this.birthDate,
      dateOfDeath: this.dateOfDeath,
      isActive: this.isActive,
      createdAt: this.createdAt ?? new Date(),
      updatedAt: this.updatedAt,
    };
  }

  public propertiesToDatabase() {
    return {
      id: this.id,
      first_name: this.firstName,
      last_name: this.lastName,
      nationality: this.nationality,
      biography: this.biography,
      awards: this.awards,
      genres: this.genres,
      notable_works: this.notableWorks,
      website: this.website,
      social_links: this.socialLinks,
      birth_date: this.birthDate,
      date_of_death: this.dateOfDeath,
      is_active: this.isActive,
    };
  }

  public update(properties: Partial<AuthorUpdate>) {
    Object.assign(this, properties);
    this.updatedAt = new Date();
  }
}
