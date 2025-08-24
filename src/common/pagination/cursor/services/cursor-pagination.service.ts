import { Injectable, Inject } from '@nestjs/common';
import { CursorPaginatedResponse, PaginatedQueryOptions } from '../interfaces';
import type { ICursorBuilder, IQueryExecutor } from '../interfaces';
import { PrismaModel } from '../types';
import { CursorQueryFactory } from '../factories';

@Injectable()
export class CursorPaginationService {
  constructor(
    @Inject('ICursorBuilder') private readonly cursorBuilder: ICursorBuilder,
    @Inject('IQueryExecutor') private readonly queryExecutor: IQueryExecutor,
    private readonly queryFactory: CursorQueryFactory
  ) {}

  async paginate<T extends PrismaModel>(
    options: PaginatedQueryOptions<T>
  ): Promise<CursorPaginatedResponse<T>> {
    const { model, query, baseWhere = {}, orderBy = { createdAt: 'desc' }, select, include } = options;
    const { take = 10, direction = 'forward' } = query;
    
    const whereClause = await this.cursorBuilder.buildWhereClause(query, baseWhere, orderBy);
    const finalOrderBy = this.cursorBuilder.buildOrderClause(orderBy, direction);

    const rawResults = await this.queryExecutor.execute<T>({
      model,
      whereClause,
      orderBy: finalOrderBy,
      take: take + 1,
      select,
      include
    });


    const processedResults = this.processResultsForDirection(rawResults, direction);
    const orderFields = Object.keys(orderBy);
    
    return this.queryFactory.createPaginatedResponse(processedResults, take, direction, orderFields);
  }

  private processResultsForDirection<T>(results: T[], direction: 'forward' | 'backward'): T[] {
    return direction === 'backward' ? results.reverse() : results;
  }
} 