import type { ListItem } from '@/modules/reading-lists/domain/entities';

export interface ListItemRepository {
  getItemsByListId(listId: string): Promise<ListItem[]>;
  addBookToList(item: ListItem): Promise<ListItem | null>;
  removeBookFromList(listId: string, bookId: string): Promise<boolean>;
  updateItemPosition(
    listId: string,
    bookId: string,
    position: number,
  ): Promise<ListItem | null>;
  updateItemNotes(
    listId: string,
    bookId: string,
    notes: string,
  ): Promise<ListItem | null>;
}
