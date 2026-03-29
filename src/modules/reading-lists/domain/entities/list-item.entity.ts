import { DatabaseErrorException } from '@/modules/shared/exceptions';

export interface ListItemEssentials {
  readingListId: string;
  bookId: string;
}

export interface ListItemOptionals {
  id: string;
  position: number;
  notes: string;
  addedAt: Date;
}

export type ListItemProperties = ListItemEssentials & Partial<ListItemOptionals>;

export class ListItem {
  private readonly id: string | undefined;
  private readingListId!: string;
  private bookId!: string;
  private position: number;
  private notes: string | undefined;
  private readonly addedAt: Date;

  constructor(properties: ListItemProperties) {
    if (!properties.id)
      throw new DatabaseErrorException('List item id is required');
    if (!properties.readingListId)
      throw new DatabaseErrorException('List item readingListId is required');
    if (!properties.bookId)
      throw new DatabaseErrorException('List item bookId is required');

    Object.assign(this, properties);

    this.position = properties.position ?? 0;

    if (properties.addedAt) {
      this.addedAt = properties.addedAt;
    } else {
      this.addedAt = new Date();
    }
  }

  public properties() {
    return {
      id: this.id,
      readingListId: this.readingListId,
      bookId: this.bookId,
      position: this.position,
      notes: this.notes,
      addedAt: this.addedAt ?? new Date(),
    };
  }

  public propertiesToDatabase() {
    return {
      id: this.id,
      reading_list: this.readingListId,
      book: this.bookId,
      position: this.position,
      notes: this.notes,
    };
  }

  public updatePosition(position: number) {
    this.position = position;
  }

  public updateNotes(notes: string) {
    this.notes = notes;
  }
}
