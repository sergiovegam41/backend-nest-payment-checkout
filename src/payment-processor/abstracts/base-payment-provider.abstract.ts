import { Injectable } from '@nestjs/common';
import type { IPaymentProvider, IPaymentConfig, IPaymentCredentials } from '../interfaces/payment-provider.interface';
import { PaymentRequestDto, PaymentLinkResponseDto, PaymentStatusResponseDto } from '../dto';
import { PaymentStatus } from '../enums/payment-status.enum';
import { CardTokenRequest, CardTokenResponse, TransactionRequest, TransactionResponse, MerchantInfoResponse } from '../interfaces';

@Injectable()
export abstract class BasePaymentProvider implements IPaymentProvider {
  protected config: IPaymentConfig;
  
  constructor(config: IPaymentConfig) {
    this.config = config;
  }

  abstract readonly name: string;
  
  abstract createPaymentLink(paymentRequest: PaymentRequestDto): Promise<PaymentLinkResponseDto>;
  
  abstract checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto>;
  
  // New transaction methods
  abstract tokenizeCard(cardData: CardTokenRequest): Promise<{ success: boolean; data?: CardTokenResponse; error_message?: string }>;
  abstract getMerchantInfo(): Promise<{ success: boolean; data?: MerchantInfoResponse; error_message?: string }>;
  abstract createTransaction(transactionData: TransactionRequest): Promise<{ success: boolean; data?: TransactionResponse; error_message?: string }>;
  abstract getTransactionStatus(transactionId: string): Promise<{ success: boolean; data?: any; error_message?: string }>;
  abstract generateSignature(reference: string, amountInCents: number, currency: string): Promise<string>;
  
  protected abstract mapProviderStatusToGeneric(providerStatus: string): PaymentStatus;
  
  protected async getCredentials(): Promise<IPaymentCredentials> {
    return await this.config.getCredentials();
  }
  
  protected getEndpoint(environment: 'sandbox' | 'uat'): string {
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