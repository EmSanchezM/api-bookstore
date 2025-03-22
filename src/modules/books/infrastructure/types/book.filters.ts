export type BookFilters = Partial<{
  title: string;
  isbn: string;
  isActive: boolean;
  skip: number;
  limit: number;
  orderBy: string;
  sortBy: string;
}>;
