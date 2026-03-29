export type UserFilters = Partial<{
  name: string;
  email: string;
  isActive: boolean;
  skip: number;
  limit: number;
  orderBy: string;
  sortBy: string;
}>;
