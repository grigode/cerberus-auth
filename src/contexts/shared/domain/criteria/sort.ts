export type SortDirection = 'ASC' | 'DESC';

export interface SortBy<T extends string = string> {
  field: T;
  direction: SortDirection;
}
