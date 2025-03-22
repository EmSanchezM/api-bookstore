import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { BookRepository } from '@/modules/books/domain/repositories';
import { UpdateBookDto } from '@/modules/books/application/dtos';
import { DatabaseErrorException, NotFoundException } from '@/modules/shared/exceptions';

@injectable()
export class UpdateBookUseCase {
  constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

  async execute(id: string, updateBookDto: UpdateBookDto) {
    const existingBook = await this.bookRepository.getBookById(id);

    if (!existingBook) throw new NotFoundException('Book not found');

    existingBook.update({
      title: updateBookDto.title ? updateBookDto.title : undefined,
      publicationDate: updateBookDto.publicationDate ? new Date(updateBookDto.publicationDate) : undefined,
    });

    const updatedBook = await this.bookRepository.updateBook(existingBook.properties().id!, existingBook);

    if (!updatedBook) throw new DatabaseErrorException('Error updating Book');

    return updatedBook;
  }
}
