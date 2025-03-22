import { AuthorProperties } from '@/modules/authors/domain/entities';
import { LanguageProperties } from '@/modules/languages/domain/entities';
import { PublisherProperties } from '@/modules/publishers/domain/entities';

import { DatabaseErrorException } from '@/modules/shared/exceptions';

export interface BookEssentials {
  title: string;
  isbn: string;
  publicationDate: Date;
  publisher: string;
  authors: string[];
  languages: string[];
  isActive: boolean;
}

export interface BookOptionals {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookUpdate {
  title: string;
  isbn: string;
  publicationDate: Date;
}

export type BookProperties = BookEssentials & Partial<BookOptionals>;

export class Book {
  private readonly id: string | undefined;
  private title!: string;
  private isbn!: string;
  private publicationDate!: Date;
  private publisher!: string | PublisherProperties;
  private authors!: string[] | AuthorProperties[];
  private languages!: string[] | LanguageProperties[];
  private isActive!: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date | undefined;

  constructor(properties: BookProperties) {
    if (!properties.id) throw new DatabaseErrorException('Book id is required');
    if (!properties.title) throw new DatabaseErrorException('Book title is required');
    if (!properties.isbn) throw new DatabaseErrorException('Book isbn is required');
    if (!properties.publicationDate) throw new DatabaseErrorException('Book publicationDate is required');
    if (!properties.publisher) throw new DatabaseErrorException('Book publisher is required');
    if (!properties.authors || !properties.authors.length) throw new DatabaseErrorException('Book authors is required');
    if (!properties.languages || !properties.languages.length)
      throw new DatabaseErrorException('Book languages is required');
    if (!properties.isActive) throw new DatabaseErrorException('Book isActive is required');

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
      title: this.title,
      isbn: this.isbn,
      publicationDate: this.publicationDate,
      publisher: this.publisher,
      authors: this.authors,
      languages: this.languages,
      isActive: this.isActive,
      createdAt: this.createdAt ?? new Date(),
      updatedAt: this.updatedAt,
    };
  }

  public propertiesToDatabase() {
    return {
      id: this.id,
      title: this.title,
      isbn: this.isbn,
      publication_date: this.publicationDate,
      publisher: typeof this.publisher === 'string' ? this.publisher : this.publisher.id,
      authors: this.authors,
      languages: this.languages,
      is_active: this.isActive,
    };
  }

  public update(properties: Partial<BookUpdate>) {
    Object.assign(this, properties);
    this.updatedAt = new Date();
  }
}
