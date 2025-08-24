import { CursorPaginationQueryDto } from '../dto';
import { PrismaDelegate } from '../types';

export interface PaginatedQueryOptions<T = any> {
  model: PrismaDelegate;
  query: CursorPaginationQueryDto;
  baseWhere?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  select?: Record<string, boolean>;
  include?: Record<string, any>;
}