export const HEALTH_STATUS = {
  OK: 'ok' as const,
  ERROR: 'error' as const,
} as const;

export const DATABASE_STATUS = {
  CONNECTED: 'connected' as const,
  DISCONNECTED: 'disconnected' as const,
} as const;

export const DEFAULT_VALUES = {
  ENVIRONMENT: 'development',
  APP_URL: 'http://localhost:3000',
} as const;