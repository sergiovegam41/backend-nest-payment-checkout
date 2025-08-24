import { Injectable, Inject } from '@nestjs/common';
import { CursorPaginatedResponse, CursorPaginationMeta } from '../interfaces';
import type { ICursorDecoder } from '../interfaces';
import { PrismaModel } from '../types';

@Injectable()
export class CursorQueryFactory {
  private static readonly DEFAULT_ORDER_FIELD = 'createdAt';
  
  constructor(@Inject('ICursorDecoder') private readonly cursorDecoder: ICursorDecoder) {}

  createPaginatedResponse<T extends PrismaModel>(
    rawData: T[],
    requestedTake: number,
    direction: 'forward' | 'backward' = 'forward',
    orderByFields: string[] = [CursorQueryFactory.DEFAULT_ORDER_FIELD]
  ): CursorPaginatedResponse<T> {
    const { data, hasMore } = this.processDataWithHasMore(rawData, requestedTake);
    const pagination = this.createPaginationMeta(data, hasMore, direction, orderByFields);
    
    return { data, pagination };
  }

  private processDataWithHasMore<T>(
    rawData: T[], 
    requestedTake: number
  ): { data: T[]; hasMore: boolean } {
    const hasMore = rawData.length > requestedTake;
    const data = rawData.slice(0, requestedTake);
    
    return { data, hasMore };
  }

  private createPaginationMeta<T extends PrismaModel>(
    data: T[],
    hasMore: boolean,
    direction: 'forward' | 'backward',
    orderByFields: string[]
  ): CursorPaginationMeta {
    const pagination: CursorPaginationMeta = {
      hasNext: this.calculateHasNext(hasMore, direction),
      hasPrevious: this.calculateHasPrevious(direction, data.length > 0)
    };

    this.addCursorsToMeta(pagination, data, hasMore, direction, orderByFields);
    
    return pagination;
  }

  private calculateHasNext(hasMore: boolean, direction: 'forward' | 'backward'): boolean {
    return direction === 'forward' ? hasMore : false;
  }

  private calculateHasPrevious(direction: 'forward' | 'backward', hasData: boolean): boolean | undefined {
    return direction === 'backward' ? hasData : undefined;
  }

  private addCursorsToMeta<T extends PrismaModel>(
    pagination: CursorPaginationMeta,
    data: T[],
    hasMore: boolean,
    direction: 'forward' | 'backward',
    orderByFields: string[]
  ): void {
    if (data.length === 0) return;

    if (pagination.hasNext && direction === 'forward') {
      pagination.nextCursor = this.createCursorFromItem(data[data.length - 1], orderByFields);
    }

    if (direction === 'backward' && data.length > 0) {
      pagination.previousCursor = this.createCursorFromItem(data[0], orderByFields);
    }
  }

  private createCursorFromItem<T extends PrismaModel>(
    item: T, 
    orderByFields: string[]
  ): string {
    const primaryOrderField = orderByFields[0] || CursorQueryFactory.DEFAULT_ORDER_FIELD;
    
    const cursorData = this.buildCursorData(item, primaryOrderField);
    
    return this.cursorDecoder.encode(cursorData);
  }

  private buildCursorData<T extends PrismaModel>(
    item: T, 
    primaryOrderField: string
  ): Record<string, any> {
    const cursorData: Record<string, any> = { id: item.id };
    
    if (this.hasValidFieldValue(item, primaryOrderField)) {
      cursorData[primaryOrderField] = item[primaryOrderField];
    }
    
    return cursorData;
  }

  private hasValidFieldValue<T extends PrismaModel>(
    item: T, 
    fieldName: string
  ): boolean {
    return item[fieldName] !== undefined && item[fieldName] !== null;
  }
}