import { Injectable } from '@nestjs/common';
import { DecodedCursor } from '../interfaces';
import type { ICursorDecoder } from '../interfaces';

@Injectable()
export class Base64CursorDecoderStrategy implements ICursorDecoder {
  decode(cursor: string): DecodedCursor {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      
      if (!parsed.id) {
        throw new Error('Cursor must contain an id field');
      }
      
      return parsed;
    } catch (error) {
      throw new Error(`Invalid cursor format: ${error.message}`);
    }
  }

  encode(id: string, additionalFields: Record<string, any> = {}): string {
    const cursorData = { id, ...additionalFields };
    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }
}