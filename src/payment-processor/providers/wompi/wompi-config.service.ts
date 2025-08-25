import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentConfig, IPaymentCredentials } from '../../interfaces/payment-provider.interface';

@Injectable()
export class WompiConfigService implements IPaymentConfig {
  private readonly PROD_ENDPOINT = 'https://api.co.uat.wompi.dev/v1';
  private readonly SANDBOX_ENDPOINT = 'https://api-sandbox.co.uat.wompi.dev/v1';
  
  constructor(private readonly configService: ConfigService) {}
  
  async getCredentials(): Promise<IPaymentCredentials> {
    return {
      private_key: this.configService.get<string>('WOMPI_PRIVATE_KEY') || 'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg',
      public_key: this.configService.get<string>('WOMPI_PUBLIC_KEY') || 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
      environment: this.configService.get<'sandbox' | 'production'>('WOMPI_ENVIRONMENT') || 'sandbox'
    };
  }
  
  getEndpoint(environment: 'sandbox' | 'production'): string {
    return environment === 'production' ? this.PROD_ENDPOINT : this.SANDBOX_ENDPOINT;
  }
}