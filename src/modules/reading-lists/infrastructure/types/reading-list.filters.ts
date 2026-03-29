export type ReadingListFilters = Partial<{
  userId: string;
  category: string;
  isPublic: boolean;
  isActive: boolean;
  name: string;
  skip: number;
  limit: number;
  orderBy: string;
  sortBy: string;
}>;
