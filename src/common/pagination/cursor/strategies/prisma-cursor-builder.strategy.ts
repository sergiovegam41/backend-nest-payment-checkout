import { Injectable, Inject } from '@nestjs/common';
import { CursorWhereClause, CursorCondition } from '../interfaces';
import type { ICursorBuilder, ICursorDecoder, IQueryExecutor } from '../interfaces';
import { CursorPaginationQueryDto } from '../dto';

@Injectable()
export class PrismaCursorBuilderStrategy implements ICursorBuilder {
  private static readonly DEFAULT_ORDER_FIELD = 'createdAt';
  private static readonly DEFAULT_ORDER_DIRECTION = 'desc';

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
    const direction = query.direction || 'forward';
    
    whereClause.cursorConditions = this.buildCursorConditions(
      decodedCursor,
      orderBy,
      orderFields,
      direction
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

    return this.reverseOrderDirection(orderBy);
  }

  private buildCursorConditions(
    decodedCursor: any,
    orderBy: Record<string, 'asc' | 'desc'>,
    orderFields: string[],
    direction: 'forward' | 'backward'
  ): CursorCondition[] {
    const primaryOrderField = this.getPrimaryOrderField(orderFields);
    const primaryDirection = orderBy[primaryOrderField] || PrismaCursorBuilderStrategy.DEFAULT_ORDER_DIRECTION;
    
    if (!decodedCursor[primaryOrderField]) {
      return [];
    }

    return this.createCursorConditions(
      decodedCursor,
      primaryOrderField,
      primaryDirection,
      direction
    );
  }

  private reverseOrderDirection(orderBy: Record<string, 'asc' | 'desc'>): Record<string, 'asc' | 'desc'> {
    const reversed: Record<string, 'asc' | 'desc'> = {};
    
    Object.entries(orderBy).forEach(([field, dir]) => {
      reversed[field] = dir === 'asc' ? 'desc' : 'asc';
    });
    
    return reversed;
  }

  private getPrimaryOrderField(orderFields: string[]): string {
    return orderFields[0] || PrismaCursorBuilderStrategy.DEFAULT_ORDER_FIELD;
  }

  private createCursorConditions(
    decodedCursor: any,
    primaryOrderField: string,
    primaryDirection: 'asc' | 'desc',
    paginationDirection: 'forward' | 'backward'
  ): CursorCondition[] {
    const timestampOperator = this.getOperatorForField(primaryDirection, paginationDirection);
    const idOperator = this.getIdOperator(primaryDirection, paginationDirection);

    return [
      {
        field: primaryOrderField,
        value: decodedCursor[primaryOrderField],
        operator: timestampOperator
      },
      {
        field: 'id',
        value: decodedCursor.id,
        operator: idOperator,
        isOrCondition: true
      }
    ];
  }

  private getOperatorForField(
    orderDirection: 'asc' | 'desc',
    paginationDirection: 'forward' | 'backward'
  ): 'lt' | 'gt' {
    const isForward = paginationDirection === 'forward';
    const isDesc = orderDirection === 'desc';
    
    return (isForward && isDesc) || (!isForward && !isDesc) ? 'lt' : 'gt';
  }

  private getIdOperator(
    primaryDirection: 'asc' | 'desc',
    paginationDirection: 'forward' | 'backward'
  ): 'lt' | 'gt' {
    const isForward = paginationDirection === 'forward';
    const isDesc = primaryDirection === 'desc';
    
    return (isForward && isDesc) || (!isForward && !isDesc) ? 'lt' : 'gt';
  }
}