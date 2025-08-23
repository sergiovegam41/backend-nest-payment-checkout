export interface AppConfig {
  nodeEnv: string;
  port: number;
  url: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  url: string;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
}