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

    // 1. Build where clause using strategy
    const whereClause = await this.cursorBuilder.buildWhereClause(query, baseWhere, orderBy);
    
    // 2. Build order clause using strategy
    const finalOrderBy = this.cursorBuilder.buildOrderClause(orderBy, direction);

    // 3. Execute query using strategy
    const results = await this.queryExecutor.execute<T>({
      model,
      whereClause,
      orderBy: finalOrderBy,
      take,
      select,
      include
    });

    // 4. Handle backward direction
    if (direction === 'backward') {
      results.reverse();
    }

    // 5. Create response using factory
    const orderFields = Object.keys(orderBy);
    return this.queryFactory.createPaginatedResponse(results, take, direction, orderFields);
  }
}