import { registerAs } from '@nestjs/config';
import { Configuration } from './interfaces/config.interface';

export default registerAs('config', (): Configuration => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.APP_PORT || '3000', 10),
    url: process.env.APP_URL || 'http://localhost:3000',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.DB_NAME || 'nest_payment_checkout',
    url: process.env.DATABASE_URL || '',
  },
  wompi: {
    uatUrl: process.env.WOMPI_UAT_URL || 'https://api.co.uat.wompi.dev/v1',
    sandboxUrl: process.env.WOMPI_SANDBOX_URL || 'https://api-sandbox.co.uat.wompi.dev/v1',
    publicKey: process.env.WOMPI_PUBLIC_KEY || '',
    privateKey: process.env.WOMPI_PRIVATE_KEY || '',
    eventsKey: process.env.WOMPI_EVENTS_KEY || '',
    integrityKey: process.env.WOMPI_INTEGRITY_KEY || '',
    environment: (process.env.WOMPI_ENVIRONMENT as 'sandbox' | 'uat') || 'sandbox',
  },
}));