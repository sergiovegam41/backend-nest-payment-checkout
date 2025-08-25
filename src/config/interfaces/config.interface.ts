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

export interface WompiConfig {
  uatUrl: string;
  sandboxUrl: string;
  publicKey: string;
  privateKey: string;
  eventsKey: string;
  integrityKey: string;
  environment: 'sandbox' | 'uat';
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  wompi: WompiConfig;
}