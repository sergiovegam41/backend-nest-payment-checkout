import { PrismaDelegate } from '../types';
import { CursorWhereClause } from './cursor-builder.interface';

export interface QueryExecutionOptions<T = any> {
  model: PrismaDelegate;
  whereClause: CursorWhereClause;
  orderBy: Record<string, 'asc' | 'desc'>;
  take: number;
  select?: Record<string, boolean>;
  include?: Record<string, any>;
}

export interface IQueryExecutor {
  execute<T>(options: QueryExecutionOptions<T>): Promise<T[]>;
  findByIdForCursor(model: PrismaDelegate, id: string, fields: string[]): Promise<any>;
}