import { logger } from 'core/config/logger';
import { inject, injectable } from 'inversify';
import type { Surreal } from 'surrealdb';
import { type RecordId, ResponseError } from 'surrealdb';
import { TYPES } from '@/core/common/constants/types';
import { DatabaseErrorException } from '@/modules/shared/exceptions';
import { fromRecordId, toRecordId } from '@/modules/shared/mappers';
import { ListItem } from '@/modules/reading-lists/domain/entities';
import type { ListItemRepository } from '@/modules/reading-lists/domain/repositories';

interface ListItemRecord {
  id: RecordId | string;
  reading_list: RecordId | string;
  book: RecordId | string;
  position: number;
  notes: string | undefined;
  added_at: string | Date;
  [key: string]: unknown;
}

@injectable()
export class SurrealListItemRepository implements ListItemRepository {
  constructor(@inject(TYPES.DatabaseConnection) private readonly db: Surreal) {}

  async getItemsByListId(listId: string): Promise<ListItem[]> {
    try {
      const listRecordId = toRecordId('reading_list', listId);

      const [response] = await this.db.query<ListItemRecord[]>(
        'SELECT * FROM list_item WHERE reading_list = $reading_list ORDER BY position ASC',
        { reading_list: listRecordId },
      );

      if (!response?.length) return [];

      if (!Array.isArray(response)) return [];

      return response.map((record: ListItemRecord) =>
        this.mapToListItem(record),
      );
    } catch (error) {
      this.handleError(error, 'getItemsByListId');
    }
  }

  async addBookToList(item: ListItem): Promise<ListItem | null> {
    try {
      const properties = item.propertiesToDatabase();
      const recordId = toRecordId('list_item', properties.id!);
      const listRecordId = toRecordId('reading_list', properties.reading_list);
      const bookRecordId = toRecordId('book', properties.book);

      const newRecord = await this.db.create(recordId).content({
        ...properties,
        reading_list: listRecordId,
        book: bookRecordId,
      });

      if (!newRecord) return null;

      // Create graph edge added_to_list
      const [readingList] = await this.db.query<any[]>(
        'SELECT user FROM reading_list WHERE id = $list_id LIMIT 1',
        { list_id: listRecordId },
      );

      if (readingList?.length) {
        const userRecordId = readingList[0].user;
        await this.db.query(
          'RELATE $user->added_to_list->$book SET reading_list = $list, created_at = time::now()',
          {
            user: userRecordId,
            book: bookRecordId,
            list: listRecordId,
          },
        );
      }

      return this.mapToListItem(newRecord);
    } catch (error) {
      this.handleError(error, 'addBookToList');
    }
  }

  async removeBookFromList(listId: string, bookId: string): Promise<boolean> {
    try {
      const listRecordId = toRecordId('reading_list', listId);
      const bookRecordId = toRecordId('book', bookId);

      const [deleted] = await this.db.query<any[]>(
        'DELETE FROM list_item WHERE reading_list = $reading_list AND book = $book RETURN BEFORE',
        { reading_list: listRecordId, book: bookRecordId },
      );

      // Remove graph edge added_to_list
      await this.db.query(
        'DELETE FROM added_to_list WHERE reading_list = $list AND out = $book',
        { list: listRecordId, book: bookRecordId },
      );

      return deleted?.length > 0;
    } catch (error) {
      this.handleError(error, 'removeBookFromList');
    }
  }

  async updateItemPosition(
    listId: string,
    bookId: string,
    position: number,
  ): Promise<ListItem | null> {
    try {
      const listRecordId = toRecordId('reading_list', listId);
      const bookRecordId = toRecordId('book', bookId);

      const [response] = await this.db.query<ListItemRecord[]>(
        'UPDATE list_item SET position = $position WHERE reading_list = $reading_list AND book = $book RETURN AFTER',
        {
          position,
          reading_list: listRecordId,
          book: bookRecordId,
        },
      );

      if (!response?.length) return null;

      return this.mapToListItem(response[0]);
    } catch (error) {
      this.handleError(error, 'updateItemPosition');
    }
  }

  async updateItemNotes(
    listId: string,
    bookId: string,
    notes: string,
  ): Promise<ListItem | null> {
    try {
      const listRecordId = toRecordId('reading_list', listId);
      const bookRecordId = toRecordId('book', bookId);

      const [response] = await this.db.query<ListItemRecord[]>(
        'UPDATE list_item SET notes = $notes WHERE reading_list = $reading_list AND book = $book RETURN AFTER',
        {
          notes,
          reading_list: listRecordId,
          book: bookRecordId,
        },
      );

      if (!response?.length) return null;

      return this.mapToListItem(response[0]);
    } catch (error) {
      this.handleError(error, 'updateItemNotes');
    }
  }

  private handleError(error: unknown, methodName: string): never {
    logger.error(`Error ${methodName}:`, error);
    if (error instanceof ResponseError) {
      throw new DatabaseErrorException({
        description: error.message,
        cause: error.stack,
      });
    }
    throw new DatabaseErrorException(error);
  }

  private mapToListItem(record: any): ListItem {
    return new ListItem({
      id: fromRecordId(record.id),
      readingListId: fromRecordId(record.reading_list),
      bookId: fromRecordId(record.book),
      position: record.position ?? 0,
      notes: record.notes,
      addedAt: new Date(record.added_at),
    });
  }
}
