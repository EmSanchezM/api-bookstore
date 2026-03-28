import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type Surreal from 'surrealdb';
import { RecordId, ResponseError, surql } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { Author } from '@/modules/authors/domain/entities';
import { Book } from '@/modules/books/domain/entities';
import type { BookRepository } from '@/modules/books/domain/repositories';
import type { BookFilters } from '@/modules/books/infrastructure/types/book.filters';
import { Language } from '@/modules/languages/domain/entities';
import { Publisher } from '@/modules/publishers/domain/entities';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';

interface BookRecord {
  id: RecordId | string;
  title: string;
  isbn: string;
  publication_date: Date;
  publisher: string | { [key: string]: unknown };
  authors: string[] | { [key: string]: unknown }[];
  languages: string[] | { [key: string]: unknown }[];
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
  [key: string]: unknown;
}

@injectable()
export class SurrealBookRepository implements BookRepository {
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getBookById(id: string): Promise<Book | null> {
    try {
      const bookRecordId = toRecordId('book', id);

      const query = `SELECT 
          id,
          title,
          isbn,
          publication_date,
          is_active,
          created_at,
          updated_at,
          publisher.name as publisher,
          languages[*].name as languages, 
          (SELECT id, first_name, last_name, nationality, birth_date, is_active FROM $parent.authors) as authors
        FROM $book
      `;

      const [response] = await this.db.query<BookRecord[]>(query, {
        book: bookRecordId,
      });

      if (!response?.length) return null;

      return this.mapToBook(response[0] as Record<string, unknown>);
    } catch (error) {
      this.handleError(error, 'getBookById');
    }
  }

  async getAllBooks(): Promise<Book[]> {
    try {
      const query = surql`SELECT 
          id,
          title,
          isbn,
          publication_date,
          is_active,
          languages[*].name as languages, 
          publisher.name as publisher,
          (SELECT id, first_name, last_name, nationality, birth_date, is_active FROM $parent.authors) as authors
        FROM book
      `;
      const [response] = await this.db.query<BookRecord[]>(query);

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((book: BookRecord) => this.mapToBook(book));
    } catch (error) {
      this.handleError(error, 'getAllBooks');
    }
  }

  criteriaToQuery(filters: BookFilters) {
    const params: {
      is_active?: boolean;
      title?: string;
      isbn?: string;
      skip?: number;
      limit?: number;
      orderBy?: string;
      sortBy?: string;
    } = {};
    const conditions: string[] = [];
    let query = `SELECT 
        id,
        title,
        isbn,
        publication_date,
        is_active,
        created_at,
        updated_at,
        publisher.name as publisher,
        languages[*].name as languages,
        (SELECT id, first_name, last_name, nationality, birth_date, is_active FROM $parent.authors) as authors
      FROM book
    `;

    if (filters.isActive !== undefined) {
      conditions.push('is_active = $is_active');
      params.is_active = filters.isActive;
    }

    if (filters.title) {
      conditions.push(
        'string::contains(string::lowercase(title), string::lowercase($title))',
      );
      params.title = filters.title;
    }

    if (filters.isbn) {
      conditions.push('isbn = $isbn');
      params.isbn = filters.isbn;
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

  async getBooksByFilters(filters: BookFilters): Promise<Book[]> {
    try {
      const { query, params } = this.criteriaToQuery(filters);

      const [response] = await this.db.query<BookRecord[]>(query, params);

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((book: BookRecord) => this.mapToBook(book));
    } catch (error) {
      this.handleError(error, 'getBooksByFilters');
    }
  }

  async createBook(book: Book): Promise<Book | null> {
    try {
      const properties = book.propertiesToDatabase();
      const bookRecordId = toRecordId('book', properties.id as string);

      if (
        properties.authors &&
        !properties.authors.every((authorId) => typeof authorId === 'string')
      )
        throw new DatabaseErrorException(
          'Book authors must be an array of strings',
        );
      if (!properties.languages.every((langId) => typeof langId === 'string'))
        throw new DatabaseErrorException(
          'Book languages must be an array of strings',
        );

      const payload = {
        ...properties,
        publisher: toRecordId('publisher', properties.publisher as string),
        authors: properties.authors?.map((authorId) =>
          toRecordId('author', authorId),
        ),
        languages: properties.languages.map((langId) =>
          toRecordId('language', langId),
        ),
        is_active: properties.is_active,
      };
      delete payload.id;

      const newBookRecord = await this.db.create(bookRecordId, payload);

      if (!newBookRecord) return null;

      console.log({ newBookRecord });

      return this.mapToBook(newBookRecord);
    } catch (error) {
      this.handleError(error, 'createBook');
    }
  }

  async updateBook(id: string, book: Book): Promise<Book | null> {
    try {
      const bookRecordId = toRecordId('book', id);
      const properties = book.properties();

      const updateData: Record<string, unknown> = {
        updated_at: new Date(),
      };

      if (properties.title !== undefined) {
        updateData.title = properties.title;
      }

      if (properties.isbn !== undefined) {
        updateData.isbn = properties.isbn;
      }

      if (properties.publicationDate !== undefined) {
        updateData.publication_date = properties.publicationDate;
      }

      const patches = Object.entries(updateData).map(([key, value]) => ({
        op: 'replace' as const,
        path: `/${key}`,
        value,
      }));

      const updatedBookRecord = await this.db.patch<BookRecord>(
        bookRecordId,
        patches,
      );

      if (!updatedBookRecord) return null;

      return this.getBookById(id);
    } catch (error: unknown) {
      this.handleError(error, 'updateBook');
    }
  }

  async deleteBook(id: string): Promise<boolean> {
    try {
      const bookRecordId = toRecordId('book', id);
      const removedBookRecord = await this.db.delete<BookRecord>(bookRecordId);

      if (!removedBookRecord) return false;

      return !!removedBookRecord.id;
    } catch (error: unknown) {
      this.handleError(error, 'deleteBook');
    }
  }

  async toggleBookStatus(id: string): Promise<boolean> {
    try {
      const bookRecordId = toRecordId('book', id);

      const currentBook = await this.db.select<BookRecord>(bookRecordId);

      if (!currentBook) return false;

      const updatedBookRecord = await this.db.update(bookRecordId, {
        is_active: !currentBook.is_active,
        updated_at: new Date(),
      });

      if (!updatedBookRecord) return false;

      return true;
    } catch (error: unknown) {
      this.handleError(error, 'toggleBookStatus');
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
    throw new DatabaseErrorException(error, `Error ${methodName} database`);
  }

  private mapToBook(record: Record<string, unknown>): Book {
    const r = record as BookRecord;
    return new Book({
      id: fromRecordId(r.id),
      title: r.title,
      isbn: r.isbn,
      publicationDate: new Date(r.publication_date),
      publisher: this.mapToPublisher(r.publisher),
      authors: Array.isArray(r.authors)
        ? (r.authors.map((author) => this.mapToAuthor(author)) as string[])
        : (r.authors as string[]),
      languages: Array.isArray(r.languages)
        ? (r.languages.map((language) =>
            this.mapToLanguage(language),
          ) as string[])
        : (r.languages as string[]),
      isActive: r.is_active,
    });
  }

  private mapToPublisher(
    publisher: string | { [key: string]: unknown },
  ): Publisher | string {
    if (typeof publisher === 'string') return publisher;

    if (publisher instanceof RecordId) return fromRecordId(publisher);

    return new Publisher({
      id: fromRecordId(publisher.id as string),
      name: publisher.name as string,
      website: publisher.website as string,
      isActive: publisher.is_active as boolean,
    });
  }

  private mapToAuthor(
    author: string | { [key: string]: unknown },
  ): Author | string {
    if (typeof author === 'string') return author;

    if (author instanceof RecordId) return fromRecordId(author);

    return new Author({
      id: fromRecordId(author.id as string),
      firstName: author.first_name as string,
      lastName: author.last_name as string,
      nationality: author.nationality as string,
      birthDate: new Date(author.birth_date as string),
      isActive: author.is_active as boolean,
    });
  }

  private mapToLanguage(
    language: string | { [key: string]: unknown },
  ): Language | string {
    if (typeof language === 'string') return language;

    if (language instanceof RecordId) return fromRecordId(language);

    return new Language({
      id: fromRecordId(language.id as string),
      isoCode: language.iso_code as string,
      name: language.name as string,
      isActive: language.is_active as boolean,
    });
  }
}
