import { Injectable } from '@nestjs/common';
import { DecodedCursor } from '../interfaces';
import type { ICursorDecoder } from '../interfaces';

@Injectable()
export class Base64CursorDecoderStrategy implements ICursorDecoder {
  private static readonly REQUIRED_CURSOR_FIELDS = ['id'] as const;

  decode(cursor: string): DecodedCursor {
    try {
      const sanitizedCursor = this.sanitizeCursor(cursor);
      const decoded = Buffer.from(sanitizedCursor, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      
      this.validateCursorData(parsed);
      
      return parsed;
    } catch (error) {
      throw new Error(`Invalid cursor format: ${error.message}`);
    }
  }

  encode(cursorData: Record<string, any>): string {
    this.validateCursorData(cursorData);
    
    const serializedData = JSON.stringify(cursorData);
    return Buffer.from(serializedData).toString('base64');
  }

  private sanitizeCursor(cursor: string): string {
    return cursor.trim().split(/[&?]/)[0];
  }

  private validateCursorData(data: any): asserts data is DecodedCursor {
    if (!data || typeof data !== 'object') {
      throw new Error('Cursor data must be an object');
    }

    for (const field of Base64CursorDecoderStrategy.REQUIRED_CURSOR_FIELDS) {
      if (!data[field]) {
        throw new Error(`Cursor must contain a valid ${field} field`);
      }
    }
  }
}