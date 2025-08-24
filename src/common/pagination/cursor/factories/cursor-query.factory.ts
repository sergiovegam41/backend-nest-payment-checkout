import { Injectable, Inject } from '@nestjs/common';
import { CursorPaginatedResponse, CursorPaginationMeta } from '../interfaces';
import type { ICursorDecoder } from '../interfaces';
import { PrismaModel } from '../types';

@Injectable()
export class CursorQueryFactory {
  constructor(@Inject('ICursorDecoder') private readonly cursorDecoder: ICursorDecoder) {}

  createPaginatedResponse<T extends PrismaModel>(
    data: T[],
    requestedTake: number,
    direction: 'forward' | 'backward' = 'forward',
    orderByFields: string[] = ['createdAt']
  ): CursorPaginatedResponse<T> {
    const hasNext = data.length === requestedTake;
    const hasPrevious = direction === 'backward' || (data.length > 0);
    
    const pagination: CursorPaginationMeta = {
      hasNext,
      hasPrevious: direction === 'backward' ? hasPrevious : undefined,
    };

    if (hasNext && data.length > 0) {
      const lastItem = data[data.length - 1];
      pagination.nextCursor = this.createCursorFromItem(lastItem, orderByFields);
    }

    if (data.length > 0 && direction === 'backward') {
      const firstItem = data[0];
      pagination.previousCursor = this.createCursorFromItem(firstItem, orderByFields);
    }

    return {
      data,
      pagination,
    };
  }

  private createCursorFromItem<T extends PrismaModel>(
    item: T, 
    orderByFields: string[]
  ): string {
    const cursorData: Record<string, any> = { id: item.id };
    
    orderByFields.forEach(field => {
      if (field in item) {
        cursorData[field] = (item as any)[field];
      }
    });

    return this.cursorDecoder.encode(item.id, cursorData);
  }
}