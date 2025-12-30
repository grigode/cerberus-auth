import { LimitVo, PageVo } from '../value-objects';

export interface Pagination {
  page: PageVo;
  limit: LimitVo;
}
