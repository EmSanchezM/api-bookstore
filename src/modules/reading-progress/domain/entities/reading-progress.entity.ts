import { DatabaseErrorException } from '@/modules/shared/exceptions';

export interface ReadingProgressEssentials {
  userId: string;
  bookId: string;
  status: string;
  totalPages: number;
  isActive: boolean;
}

export interface ReadingProgressOptionals {
  id: string;
  currentPage: number;
  percentage: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgressUpdate {
  currentPage: number;
  totalPages: number;
  status: string;
}

export type ReadingProgressProperties = ReadingProgressEssentials &
  Partial<ReadingProgressOptionals>;

export class ReadingProgress {
  private readonly id: string | undefined;
  private userId!: string;
  private bookId!: string;
  private status!: string;
  private currentPage!: number;
  private totalPages!: number;
  private percentage!: number;
  private startedAt: Date | null;
  private finishedAt: Date | null;
  private lastReadAt: Date;
  private isActive!: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date | undefined;

  constructor(properties: ReadingProgressProperties) {
    if (!properties.id)
      throw new DatabaseErrorException('Reading progress id is required');
    if (!properties.userId)
      throw new DatabaseErrorException('Reading progress userId is required');
    if (!properties.bookId)
      throw new DatabaseErrorException('Reading progress bookId is required');
    if (!properties.totalPages)
      throw new DatabaseErrorException(
        'Reading progress totalPages is required',
      );

    Object.assign(this, properties);

    this.currentPage = properties.currentPage ?? 0;
    this.percentage = properties.percentage ?? 0;
    this.startedAt = properties.startedAt ?? null;
    this.finishedAt = properties.finishedAt ?? null;
    this.lastReadAt = properties.lastReadAt ?? new Date();
    this.createdAt = properties.createdAt ?? new Date();
  }

  public properties() {
    return {
      id: this.id,
      userId: this.userId,
      bookId: this.bookId,
      status: this.status,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      percentage: this.percentage,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      lastReadAt: this.lastReadAt,
      isActive: this.isActive,
      createdAt: this.createdAt ?? new Date(),
      updatedAt: this.updatedAt,
    };
  }

  public propertiesToDatabase() {
    return {
      id: this.id,
      user: this.userId,
      book: this.bookId,
      status: this.status,
      current_page: this.currentPage,
      total_pages: this.totalPages,
      percentage: this.percentage,
      started_at: this.startedAt,
      finished_at: this.finishedAt,
      last_read_at: this.lastReadAt,
      is_active: this.isActive,
    };
  }

  public update(properties: Partial<ReadingProgressUpdate>) {
    if (properties.totalPages !== undefined) {
      this.totalPages = properties.totalPages;
    }

    if (properties.currentPage !== undefined) {
      this.currentPage = properties.currentPage;
      this.percentage = (this.currentPage / this.totalPages) * 100;
    }

    if (properties.status !== undefined) {
      if (properties.status === 'reading' && !this.startedAt) {
        this.startedAt = new Date();
      }

      if (properties.status === 'finished') {
        this.finishedAt = new Date();
        this.currentPage = this.totalPages;
        this.percentage = 100;
      }

      this.status = properties.status;
    }

    this.lastReadAt = new Date();
    this.updatedAt = new Date();
  }
}
