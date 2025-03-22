import { Book } from '@/modules/books/domain/entities';
import { BookFilters } from '@/modules/books/infrastructure/types/book.filters';

export interface BookRepository {
  getBookById(id: string): Promise<Book | null>;
  getAllBooks(): Promise<Book[]>;
  getBooksByFilters(filters: BookFilters): Promise<Book[]>;
  createBook(book: Book): Promise<Book | null>;
  updateBook(id: string, book: Book): Promise<Book | null>;
  deleteBook(id: string): Promise<boolean>;
  toggleBookStatus(id: string): Promise<boolean>;
}
