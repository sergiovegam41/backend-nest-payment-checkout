export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database: 'connected' | 'disconnected';
  uptime: number;
  environment: string;
  url: string;
  error?: string;
}

export interface DatabaseHealthResponse {
  status: 'connected' | 'disconnected';
  error?: string;
}