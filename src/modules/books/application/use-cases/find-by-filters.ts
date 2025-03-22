import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { BookRepository } from '@/modules/books/domain/repositories';
import { BookFilters } from '@/modules/books/infrastructure/types/book.filters';

@injectable()
export class FindByFiltersBookUseCase {
  constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

  async execute(filters: BookFilters) {
    const books = await this.bookRepository.getBooksByFilters(filters);

    if (!books.length) return [];

    return books;
  }
}
