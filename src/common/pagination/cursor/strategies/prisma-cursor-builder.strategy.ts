import { Injectable, Inject } from '@nestjs/common';
import { CursorWhereClause, CursorCondition } from '../interfaces';
import type { ICursorBuilder, ICursorDecoder, IQueryExecutor } from '../interfaces';
import { CursorPaginationQueryDto } from '../dto';

@Injectable()
export class PrismaCursorBuilderStrategy implements ICursorBuilder {
  constructor(
    @Inject('ICursorDecoder') private readonly cursorDecoder: ICursorDecoder,
    @Inject('IQueryExecutor') private readonly queryExecutor: IQueryExecutor
  ) {}

  async buildWhereClause(
    query: CursorPaginationQueryDto,
    baseWhere: Record<string, any>,
    orderBy: Record<string, 'asc' | 'desc'>
  ): Promise<CursorWhereClause> {
    const whereClause: CursorWhereClause = {
      baseWhere: { ...baseWhere }
    };

    if (!query.cursor) {
      return whereClause;
    }

    const decodedCursor = this.cursorDecoder.decode(query.cursor);
    const orderFields = Object.keys(orderBy);
    
    whereClause.excludeId = decodedCursor.id;
    whereClause.cursorConditions = await this.buildCursorConditions(
      decodedCursor,
      orderBy,
      orderFields,
      query.direction || 'forward'
    );

    return whereClause;
  }

  buildOrderClause(
    orderBy: Record<string, 'asc' | 'desc'>,
    direction: 'forward' | 'backward'
  ): Record<string, 'asc' | 'desc'> {
    if (direction === 'forward') {
      return { ...orderBy };
    }

    // Reverse order for backward pagination
    const reversed: Record<string, 'asc' | 'desc'> = {};
    Object.entries(orderBy).forEach(([field, dir]) => {
      reversed[field] = dir === 'asc' ? 'desc' : 'asc';
    });
    
    return reversed;
  }

  private async buildCursorConditions(
    decodedCursor: any,
    orderBy: Record<string, 'asc' | 'desc'>,
    orderFields: string[],
    direction: 'forward' | 'backward'
  ): Promise<CursorCondition[]> {
    const conditions: CursorCondition[] = [];

    for (const field of orderFields) {
      const orderDirection = orderBy[field];
      const fieldValue = decodedCursor[field];
      
      if (fieldValue !== undefined) {
        const operator = this.getOperatorForField(orderDirection, direction);
        conditions.push({
          field,
          value: fieldValue,
          operator
        });
      }
    }

    return conditions;
  }

  private getOperatorForField(
    orderDirection: 'asc' | 'desc',
    paginationDirection: 'forward' | 'backward'
  ): 'lt' | 'gt' | 'lte' | 'gte' {
    if (paginationDirection === 'forward') {
      return orderDirection === 'desc' ? 'lt' : 'gt';
    } else {
      return orderDirection === 'desc' ? 'gt' : 'lt';
    }
  }
}