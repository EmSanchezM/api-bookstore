import type { ReadingList } from '@/modules/reading-lists/domain/entities';
import type { ReadingListFilters } from '@/modules/reading-lists/infrastructure/types/reading-list.filters';

export interface ReadingListRepository {
  getReadingListById(id: string): Promise<ReadingList | null>;
  getReadingListsByUserId(userId: string): Promise<ReadingList[]>;
  getPublicReadingLists(): Promise<ReadingList[]>;
  getReadingListsByFilters(filters: ReadingListFilters): Promise<ReadingList[]>;
  createReadingList(list: ReadingList): Promise<ReadingList | null>;
  updateReadingList(id: string, list: ReadingList): Promise<ReadingList | null>;
  deleteReadingList(id: string): Promise<boolean>;
}
