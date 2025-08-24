import { CursorPaginationQueryDto } from '../dto/cursor-pagination-query.dto';

export interface CursorCondition {
  field: string;
  value: any;
  operator: 'lt' | 'gt' | 'lte' | 'gte';
  isOrCondition?: boolean;
}

export interface CursorWhereClause {
  baseWhere: Record<string, any>;
  cursorConditions?: CursorCondition[];
  excludeId?: string;
}

export interface ICursorBuilder {
  buildWhereClause(
    query: CursorPaginationQueryDto,
    baseWhere: Record<string, any>,
    orderBy: Record<string, 'asc' | 'desc'>
  ): Promise<CursorWhereClause>;
  
  buildOrderClause(
    orderBy: Record<string, 'asc' | 'desc'>,
    direction: 'forward' | 'backward'
  ): Record<string, 'asc' | 'desc'>;
}