import { inject, injectable } from 'inversify';
import Surreal, { RecordId, ResponseError, surql } from 'surrealdb';

import { Book } from '@/modules/books/domain/entities';
import { BookRepository } from '@/modules/books/domain/repositories';
import { BookFilters } from '@/modules/books/infrastructure/types/book.filters';

import { logger } from 'core/config/logger';
import { TYPES } from '@/core/common/constants/types';
import { SurrealRecordIdMapper } from '@/modules/shared/mappers';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { Publisher } from '@/modules/publishers/domain/entities';
import { Author } from '@/modules/authors/domain/entities';

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
      const bookRecordId = SurrealRecordIdMapper.toRecordId('book', id);

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

      const [response] = await this.db.query<BookRecord[]>(query, { book: bookRecordId });

      if (!response?.length) return null;

      return this.mapToBook(response[0]);
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

      return response.map((book: any) => this.mapToBook(book));
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
      conditions.push('string::contains(string::lowercase(title), string::lowercase($title))');
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
      const bookRecordId = SurrealRecordIdMapper.toRecordId('book', properties.id!);

      if (!properties.authors.every((authorId) => typeof authorId === 'string'))
        throw new DatabaseErrorException('Book authors must be an array of strings');
      if (!properties.languages.every((langId) => typeof langId === 'string'))
        throw new DatabaseErrorException('Book languages must be an array of strings');

      const payload = {
        ...properties,
        publisher: SurrealRecordIdMapper.toRecordId('publisher', properties.publisher!),
        authors: properties.authors.map((authorId) => SurrealRecordIdMapper.toRecordId('author', authorId)),
        languages: properties.languages.map((langId) => SurrealRecordIdMapper.toRecordId('language', langId)),
        is_active: properties.is_active,
      };

      const newBookRecord = await this.db.create(bookRecordId, payload);

      if (!newBookRecord) return null;

      return this.mapToBook(newBookRecord);
    } catch (error) {
      this.handleError(error, 'createBook');
    }
  }

  async updateBook(id: string, Book: Book): Promise<Book | null> {
    try {
      const bookRecordId = SurrealRecordIdMapper.toRecordId('book', id);
      const properties = Book.properties();

      const payload: Partial<BookRecord> = {
        title: properties.title,
        isbn: properties.isbn,
        publication_date: properties.publicationDate,
        is_active: properties.isActive,
        created_at: properties.createdAt,
        updated_at: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const updatedBookRecord = await this.db.update(bookRecordId, payload);

      if (!updatedBookRecord) return null;

      return this.mapToBook(updatedBookRecord);
    } catch (error: unknown) {
      this.handleError(error, 'updateBook');
    }
  }

  async deleteBook(id: string): Promise<boolean> {
    try {
      const bookRecordId = SurrealRecordIdMapper.toRecordId('book', id);
      const removedBookRecord = await this.db.delete<BookRecord>(bookRecordId);

      if (!removedBookRecord) return false;

      return removedBookRecord.id ? true : false;
    } catch (error: unknown) {
      this.handleError(error, 'deleteBook');
    }
  }

  async toggleBookStatus(id: string): Promise<boolean> {
    try {
      const bookRecordId = SurrealRecordIdMapper.toRecordId('book', id);

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
    throw new DatabaseErrorException(error);
  }

  private mapToBook(record: any): Book {
    return new Book({
      id: SurrealRecordIdMapper.fromRecordId(record.id),
      title: record.title,
      isbn: record.isbn,
      publicationDate: new Date(record.publication_date),
      publisher: typeof record.publisher === 'string' ? record.publisher : this.mapToPublisher(record.publisher[0]),
      authors: Array.isArray(record.authors) ? this.mapToAuthors(record.authors) : record.authors,
      languages: record.languages,
      isActive: record.is_active,
    });
  }

  private mapToPublisher(record: any): Publisher {
    return new Publisher({
      id: SurrealRecordIdMapper.fromRecordId(record.id),
      name: record.name,
      website: record.website,
      isActive: record.is_active,
    });
  }

  private mapToAuthors(record: any): Author[] {
    return record.map((author: any) => {
      return new Author({
        id: SurrealRecordIdMapper.fromRecordId(author.id),
        firstName: author.first_name,
        lastName: author.last_name,
        nationality: author.nationality,
        birthDate: new Date(author.birth_date),
        isActive: author.is_active,
      });
    });
  }
}
