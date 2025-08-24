export interface CursorPaginationQuery {
  cursor?: string;
  take?: number;
  direction?: 'forward' | 'backward';
}

export interface CursorPaginationMeta {
  hasNext: boolean;
  hasPrevious?: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPaginationMeta;
}