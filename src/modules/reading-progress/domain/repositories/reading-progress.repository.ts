import type { ReadingProgress } from '@/modules/reading-progress/domain/entities';
import type { ReadingProgressFilters } from '@/modules/reading-progress/infrastructure/types/reading-progress.filters';

export interface ReadingProgressRepository {
  getProgressById(id: string): Promise<ReadingProgress | null>;
  getProgressByUserAndBook(
    userId: string,
    bookId: string,
  ): Promise<ReadingProgress | null>;
  getProgressByUserId(userId: string): Promise<ReadingProgress[]>;
  getProgressByFilters(
    filters: ReadingProgressFilters,
  ): Promise<ReadingProgress[]>;
  createProgress(progress: ReadingProgress): Promise<ReadingProgress | null>;
  updateProgress(
    id: string,
    progress: ReadingProgress,
  ): Promise<ReadingProgress | null>;
  deleteProgress(id: string): Promise<boolean>;
  getUserStats(userId: string): Promise<{
    totalBooks: number;
    finished: number;
    reading: number;
    wantToRead: number;
    abandoned: number;
  }>;
}
