export interface DecodedCursor {
  id: string;
  [key: string]: any;
}

export interface ICursorDecoder {
  decode(cursor: string): DecodedCursor;
  encode(id: string, additionalFields?: Record<string, any>): string;
}