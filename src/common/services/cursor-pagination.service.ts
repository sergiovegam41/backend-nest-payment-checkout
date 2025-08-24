import { Injectable } from '@nestjs/common';
import { CursorPaginatedResponse } from '../interfaces/cursor-pagination.interface';
import { CursorPaginationUtil } from '../utils/cursor-pagination.util';
import { PaginatedQueryOptions } from '../interfaces/paginated-query-options.interface';
import { PrismaModel } from '../types/prisma-model.type';

@Injectable()
export class CursorPaginationService {
  async paginate<T extends PrismaModel>(
    options: PaginatedQueryOptions<T>
  ): Promise<CursorPaginatedResponse<T>> {
    const { model, query, baseWhere = {}, orderBy = { createdAt: 'desc' }, select, include } = options;
    const { cursor, take = 10, direction = 'forward' } = query;

    let whereClause: any = { ...baseWhere };
    let finalOrderBy: any = { ...orderBy };

    if (cursor) {
      const decodedCursor = CursorPaginationUtil.decodeCursor(cursor);
      const cursorRecord = await this.getCursorRecord(model, decodedCursor.id);
      
      if (cursorRecord) {
        const orderField = Object.keys(orderBy)[0] || 'createdAt';
        const orderDirection = orderBy[orderField] || 'desc';
        
        if (direction === 'forward') {
          whereClause = {
            ...whereClause,
            id: { not: decodedCursor.id },
            [orderField]: orderDirection === 'desc' 
              ? { lt: cursorRecord[orderField] }
              : { gt: cursorRecord[orderField] }
          };
        } else {
          whereClause = {
            ...whereClause,
            id: { not: decodedCursor.id },
            [orderField]: orderDirection === 'desc' 
              ? { gt: cursorRecord[orderField] }
              : { lt: cursorRecord[orderField] }
          };
          finalOrderBy = this.reverseOrderBy(orderBy);
        }
      }
    }

    const findManyArgs: any = {
      where: whereClause,
      orderBy: finalOrderBy,
      take,
    };

    if (select) findManyArgs.select = select;
    if (include) findManyArgs.include = include;

    const results = await model.findMany(findManyArgs);

    if (direction === 'backward') {
      results.reverse();
    }

    return CursorPaginationUtil.createResponse(results as T[], take, direction);
  }

  private async getCursorRecord(model: any, id: string): Promise<any> {
    try {
      return await model.findUnique({
        where: { id },
        select: { id: true, createdAt: true, updatedAt: true }
      });
    } catch (error) {
      return null;
    }
  }

  private reverseOrderBy(orderBy: Record<string, 'asc' | 'desc'>): Record<string, 'asc' | 'desc'> {
    const reversed: Record<string, 'asc' | 'desc'> = {};
    
    Object.entries(orderBy).forEach(([field, direction]) => {
      reversed[field] = direction === 'asc' ? 'desc' : 'asc';
    });
    
    return reversed;
  }
}