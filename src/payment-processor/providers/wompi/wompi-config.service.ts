import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentConfig, IPaymentCredentials } from '../../interfaces/payment-provider.interface';

@Injectable()
export class WompiConfigService implements IPaymentConfig {
  // Wompi API endpoints
  private readonly UAT_ENDPOINT = 'https://api.co.uat.wompi.dev/v1';
  private readonly SANDBOX_ENDPOINT = 'https://api-sandbox.co.uat.wompi.dev/v1';
  
  // Official checkout URLs (same for all environments according to docs)
  private readonly PROD_CHECKOUT_URL = 'https://checkout.wompi.co/l/';
  private readonly SANDBOX_CHECKOUT_URL = 'https://checkout.wompi.co/l/';
  
  constructor(private readonly configService: ConfigService) {}
  
  async getCredentials(): Promise<IPaymentCredentials & { events_key: string; integrity_key: string }> {
    return {
      private_key: this.configService.get<string>('config.wompi.privateKey') || 'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg',
      public_key: this.configService.get<string>('config.wompi.publicKey') || 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
      events_key: this.configService.get<string>('config.wompi.eventsKey') || 'stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N',
      integrity_key: this.configService.get<string>('config.wompi.integrityKey') || 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp',
      environment: this.configService.get<'sandbox' | 'uat'>('config.wompi.environment') || 'sandbox'
    };
  }
  
  getEndpoint(environment: 'sandbox' | 'uat'): string {
    return environment === 'uat' ? this.UAT_ENDPOINT : this.SANDBOX_ENDPOINT;
  }

  getCheckoutUrl(environment: 'sandbox' | 'uat'): string {
    return environment === 'uat' ? this.PROD_CHECKOUT_URL : this.SANDBOX_CHECKOUT_URL;
  }

  /**
   * Get merchant info endpoint for obtaining acceptance tokens
   */
  getMerchantEndpoint(publicKey: string, environment: 'sandbox' | 'uat'): string {
    const baseEndpoint = this.getEndpoint(environment);
    return `${baseEndpoint}/merchants/${publicKey}`;
  }
}