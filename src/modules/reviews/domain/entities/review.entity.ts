import { DatabaseErrorException } from '@/modules/shared/exceptions';

export interface ReviewEssentials {
  userId: string;
  bookId: string;
  rating: number;
  title: string;
  body: string;
  isActive: boolean;
}

export interface ReviewOptionals {
  id: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewUpdate {
  rating: number;
  title: string;
  body: string;
}

export type ReviewProperties = ReviewEssentials & Partial<ReviewOptionals>;

export class Review {
  private readonly id: string | undefined;
  private userId!: string;
  private bookId!: string;
  private rating!: number;
  private title!: string;
  private body!: string;
  private parentId: string | null;
  private isActive!: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date | undefined;

  constructor(properties: ReviewProperties) {
    if (!properties.id)
      throw new DatabaseErrorException('Review id is required');
    if (!properties.userId)
      throw new DatabaseErrorException('Review userId is required');
    if (!properties.bookId)
      throw new DatabaseErrorException('Review bookId is required');
    if (!properties.rating)
      throw new DatabaseErrorException('Review rating is required');
    if (!properties.title)
      throw new DatabaseErrorException('Review title is required');
    if (!properties.body)
      throw new DatabaseErrorException('Review body is required');

    Object.assign(this, properties);

    this.parentId = properties.parentId ?? null;
    this.createdAt = properties.createdAt ?? new Date();
  }

  public properties() {
    return {
      id: this.id,
      userId: this.userId,
      bookId: this.bookId,
      rating: this.rating,
      title: this.title,
      body: this.body,
      parentId: this.parentId,
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
      rating: this.rating,
      title: this.title,
      body: this.body,
      parent: this.parentId ?? undefined,
      is_active: this.isActive,
    };
  }

  public update(properties: Partial<ReviewUpdate>) {
    if (properties.rating !== undefined) {
      this.rating = properties.rating;
    }

    if (properties.title !== undefined) {
      this.title = properties.title;
    }

    if (properties.body !== undefined) {
      this.body = properties.body;
    }

    this.updatedAt = new Date();
  }
}
