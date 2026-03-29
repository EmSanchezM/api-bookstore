export type ReviewFilters = Partial<{
  bookId: string;
  userId: string;
  rating: number;
  isActive: boolean;
  skip: number;
  limit: number;
  orderBy: string;
  sortBy: string;
}>;
