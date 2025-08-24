export interface DecodedCursor {
  id: string;
  [key: string]: any;
}

export interface ICursorDecoder {
  decode(cursor: string): DecodedCursor;
  encode(cursorData: Record<string, any>): string;
}