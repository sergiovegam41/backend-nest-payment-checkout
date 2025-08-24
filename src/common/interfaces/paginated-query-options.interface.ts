import { CursorPaginationQueryDto } from '../dto/cursor-pagination-query.dto';
import { PrismaDelegate } from '../types/prisma-model.type';

export interface PaginatedQueryOptions<T = any> {
  model: PrismaDelegate;
  query: CursorPaginationQueryDto;
  baseWhere?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  select?: Record<string, boolean>;
  include?: Record<string, any>;
}