import { Author } from '@/modules/authors/domain/entities';
import { AuthorFilters } from '@/modules/authors/infrastructure/types/author.filters';

export interface AuthorRepository {
  getAuthorById(id: string): Promise<Author | null>;
  getAllAuthors(): Promise<Author[]>;
  getAuthorsByFilters(filters: AuthorFilters): Promise<Author[]>;
  createAuthor(Author: Author): Promise<Author | null>;
  updateAuthor(id: string, Author: Author): Promise<Author | null>;
  deleteAuthor(id: string): Promise<boolean>;
  toggleAuthorStatus(id: string): Promise<boolean>;
}
