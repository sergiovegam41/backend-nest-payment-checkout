import { CursorPaginatedResponse, CursorPaginationMeta } from '../interfaces/cursor-pagination.interface';

export class CursorPaginationUtil {
  static createResponse<T extends { id: string }>(
    data: T[],
    requestedTake: number,
    direction: 'forward' | 'backward' = 'forward'
  ): CursorPaginatedResponse<T> {
    const hasNext = data.length === requestedTake;
    const hasPrevious = direction === 'backward' || (data.length > 0);
    
    const nextCursor = hasNext && data.length > 0 
      ? this.encodeCursor(data[data.length - 1].id)
      : undefined;
      
    const previousCursor = data.length > 0 
      ? this.encodeCursor(data[0].id)
      : undefined;

    const pagination: CursorPaginationMeta = {
      hasNext,
      hasPrevious: direction === 'backward' ? hasPrevious : undefined,
      nextCursor,
      previousCursor: direction === 'backward' ? previousCursor : undefined,
    };

    return {
      data,
      pagination,
    };
  }

  static encodeCursor(id: string): string {
    return Buffer.from(JSON.stringify({ id })).toString('base64');
  }

  static decodeCursor(cursor: string): { id: string } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Invalid cursor format');
    }
  }
}