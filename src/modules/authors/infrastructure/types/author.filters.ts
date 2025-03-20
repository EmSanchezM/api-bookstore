export type AuthorFilters = Partial<{
  name: string;
  nationality: string;
  isActive: boolean;
  skip: number;
  limit: number;
  orderBy: string;
  sortBy: string;
}>;
