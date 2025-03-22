import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';

import { Book } from '@/modules/books/domain/entities';
import { BookRepository } from '@/modules/books/domain/repositories';
import { CreateBookDto } from '@/modules/books/application/dtos';
import { BadRequestException, InternalServerErrorException } from '@/modules/shared/exceptions';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class CreateBookUseCase {
  constructor(@inject(TYPES.BookRepository) private bookRepository: BookRepository) {}

  async execute(createBookDto: CreateBookDto): Promise<Book> {
    if (!Array.isArray(createBookDto.authors)) throw new BadRequestException('Book authors must be an array');
    if (!Array.isArray(createBookDto.languages)) throw new BadRequestException('Book languages must be an array');

    if (!createBookDto.authors.every((authorId) => typeof authorId === 'string'))
      throw new BadRequestException('Book authors must be an array of strings');
    if (!createBookDto.languages.every((langId) => typeof langId === 'string'))
      throw new BadRequestException('Book languages must be an array of strings');

    const book = new Book({
      id: generateUUID(),
      isActive: true,
      title: createBookDto.title,
      isbn: createBookDto.isbn,
      publicationDate: new Date(createBookDto.publicationDate),
      publisher: createBookDto.publisher,
      authors: createBookDto.authors,
      languages: createBookDto.languages,
    });

    const createdBook = await this.bookRepository.createBook(book);

    if (!createdBook) throw new InternalServerErrorException('Error creating Book');

    return createdBook;
  }
}
