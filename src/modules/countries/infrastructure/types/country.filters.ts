export type CountryFilters = Partial<{
  name: string;
  isoCode: string;
  isActive: boolean;
  skip: number;
  limit: number;
  orderBy: string;
  sortBy: string;
}>;
