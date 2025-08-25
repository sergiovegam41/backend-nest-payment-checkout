import { PaymentRequestDto, PaymentLinkResponseDto, PaymentStatusResponseDto } from '../dto';
import { CardTokenRequest, CardTokenResponse } from './card-token.interface';
import { TransactionRequest, TransactionResponse } from './transaction.interface';
import { MerchantInfoResponse } from './merchant-info.interface';

export interface IPaymentProvider {
  readonly name: string;
  
  // Legacy payment link methods (deprecated but maintained for compatibility)
  createPaymentLink(paymentRequest: PaymentRequestDto): Promise<PaymentLinkResponseDto>;
  checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto>;
  
  // New direct transaction methods
  tokenizeCard(cardData: CardTokenRequest): Promise<{ success: boolean; data?: CardTokenResponse; error_message?: string }>;
  getMerchantInfo(): Promise<{ success: boolean; data?: MerchantInfoResponse; error_message?: string }>;
  createTransaction(transactionData: TransactionRequest): Promise<{ success: boolean; data?: TransactionResponse; error_message?: string }>;
  getTransactionStatus(transactionId: string): Promise<{ success: boolean; data?: any; error_message?: string }>;
  
  // Utility methods
  generateSignature(reference: string, amountInCents: number, currency: string): Promise<string>;
  
  validateWebhook?(payload: any): boolean;
}

export interface IPaymentCredentials {
  private_key: string;
  public_key?: string;
  environment: 'sandbox' | 'uat';
  integrity_key?: string;
}

export interface IPaymentConfig {
  getCredentials(): Promise<IPaymentCredentials>;
  getEndpoint(environment: 'sandbox' | 'uat'): string;
}