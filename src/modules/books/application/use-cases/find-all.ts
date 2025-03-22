import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { BookRepository } from '@/modules/books/domain/repositories';

@injectable()
export class FindAllBooksUseCase {
  constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

  async execute() {
    const books = await this.bookRepository.getAllBooks();

    if (!books.length) return [];

    return books;
  }
}
