export interface PaginatedResult<T> {
  count: number;
  pages: number;
  limit: number;
  items: T[];
}
