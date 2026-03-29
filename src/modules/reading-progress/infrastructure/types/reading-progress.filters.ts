export type ReadingProgressFilters = Partial<{
  userId: string;
  bookId: string;
  status: string;
  isActive: boolean;
  skip: number;
  limit: number;
  orderBy: string;
  sortBy: string;
}>;
