import { Injectable } from '@nestjs/common';
import type { IPaymentProvider, IPaymentConfig, IPaymentCredentials } from '../interfaces/payment-provider.interface';
import { PaymentRequestDto, PaymentLinkResponseDto, PaymentStatusResponseDto } from '../dto';
import { PaymentStatus } from '../enums/payment-status.enum';

@Injectable()
export abstract class BasePaymentProvider implements IPaymentProvider {
  protected config: IPaymentConfig;
  
  constructor(config: IPaymentConfig) {
    this.config = config;
  }

  abstract readonly name: string;
  
  abstract createPaymentLink(paymentRequest: PaymentRequestDto): Promise<PaymentLinkResponseDto>;
  
  abstract checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto>;
  
  protected abstract mapProviderStatusToGeneric(providerStatus: string): PaymentStatus;
  
  protected async getCredentials(): Promise<IPaymentCredentials> {
    return await this.config.getCredentials();
  }
  
  protected getEndpoint(environment: 'sandbox' | 'production'): string {
    return this.config.getEndpoint(environment);
  }
  
  protected handleError(error: any, operation: string): PaymentLinkResponseDto | PaymentStatusResponseDto {
    console.error(`Error in ${this.name} ${operation}:`, error);
    
    if (operation === 'createPaymentLink') {
      return new PaymentLinkResponseDto(false, null, null, `Payment link creation failed: ${error.message}`);
    } else {
      return new PaymentStatusResponseDto(false, null, null, '', `Payment status check failed: ${error.message}`);
    }
  }
  
  protected validatePaymentRequest(request: PaymentRequestDto): void {
    if (!request.amount_in_cents || request.amount_in_cents <= 0) {
      throw new Error('Amount in cents must be greater than 0');
    }
  }
}