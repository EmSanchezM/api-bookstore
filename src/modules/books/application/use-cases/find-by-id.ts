import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { BookRepository } from '@/modules/books/domain/repositories';
import { NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class FindByIdBookUseCase {
  constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

  async execute(id: string) {
    const book = await this.bookRepository.getBookById(id);

    if (!book) throw new NotFoundException('Book not found');

    return book;
  }
}
