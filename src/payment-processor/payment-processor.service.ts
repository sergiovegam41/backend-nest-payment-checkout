import { Injectable, Logger } from '@nestjs/common';
import { PaymentProviderFactory } from './factories/payment-provider.factory';
import type { IPaymentProvider } from './interfaces/payment-provider.interface';
import type { CardTokenRequest, TransactionRequest } from './interfaces';
import { PaymentProcessorException } from './exceptions';
import { 
  TransactionResponseDto, 
  TokenizationResponseDto, 
  MerchantInfoResponseDto, 
  SignatureResponseDto 
} from './dtos/responses';

@Injectable()
export class PaymentProcessorService {
  private readonly logger = new Logger(PaymentProcessorService.name);

  constructor(
    private readonly providerFactory: PaymentProviderFactory
  ) {}
  
  
  
  getAvailableProviders(): string[] {
    return this.providerFactory.getAvailableProviders();
  }
  
  getProvider(providerName?: string): IPaymentProvider {
    return providerName ? this.getProviderByName(providerName) : this.getDefaultProvider();
  }
  
  private getDefaultProvider(): IPaymentProvider {
    return this.providerFactory.getDefaultProvider();
  }

  private getProviderByName(providerName: string): IPaymentProvider {
    return this.providerFactory.getProvider(providerName);
  }

  // ========================================
  // DIRECT TRANSACTION METHODS
  // ========================================

  /**
   * Process complete direct transaction flow
   * This is the main method that ProductCheckout should call
   */
  async processDirectTransaction(
    checkoutId: string,
    amountInCents: number,
    currency: string,
    customerEmail: string,
    cardData: CardTokenRequest,
    providerName?: string
  ): Promise<TransactionResponseDto> {
    this.logger.log(`Starting direct transaction processing for checkout: ${checkoutId}`);
    
    try {
      const provider = this.getProvider(providerName);
      this.logger.debug(`Using payment provider: ${providerName || 'default'}`);

      // 1. Get merchant info for acceptance token
      this.logger.debug('Step 1: Retrieving merchant information');
      const merchantInfo = await provider.getMerchantInfo();
      
      if (!merchantInfo.success || !merchantInfo.data) {
        throw PaymentProcessorException.merchantInfoUnavailable('Failed to get merchant information');
      }

      // 2. Tokenize card data
      this.logger.debug('Step 2: Tokenizing card data');
      const tokenResult = await provider.tokenizeCard(cardData);
      
      if (!tokenResult.success || !tokenResult.data) {
        throw PaymentProcessorException.tokenizationFailed(
          tokenResult.error_message || 'Card tokenization failed'
        );
      }

      // 3. Generate signature
      this.logger.debug('Step 3: Generating transaction signature');
      const signature = await provider.generateSignature(checkoutId, amountInCents, currency);
      
      if (!signature) {
        throw PaymentProcessorException.signatureGenerationFailed('Failed to generate transaction signature');
      }

      // 4. Create transaction
      this.logger.debug('Step 4: Creating transaction');
      const transactionRequest: TransactionRequest = {
        amount_in_cents: amountInCents,
        currency: currency,
        customer_email: customerEmail,
        reference: checkoutId,
        payment_method: {
          type: 'CARD',
          token: tokenResult.data.data.id,
          installments: 1
        },
        acceptance_token: merchantInfo.data.data.presigned_acceptance.acceptance_token,
        signature: signature
      };

      const transactionResult = await provider.createTransaction(transactionRequest);

      if (!transactionResult.success || !transactionResult.data) {
        throw PaymentProcessorException.transactionFailed(
          transactionResult.error_message || 'Transaction processing failed'
        );
      }

      this.logger.log(`Transaction processed successfully. ID: ${transactionResult.data.data.id}`);
      
      return {
        success: true,
        data: {
          transactionId: transactionResult.data.data.id,
          status: transactionResult.data.data.status,
          reference: checkoutId,
          amount_in_cents: amountInCents,
          currency: currency
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`Transaction processing failed for checkout ${checkoutId}:`, error.message);
      
      if (error instanceof PaymentProcessorException) {
        throw error;
      }
      
      throw PaymentProcessorException.transactionFailed(
        'Unexpected error during transaction processing',
        { originalError: error.message }
      );
    }
  }

  /**
   * Tokenize card data
   */
  async tokenizeCard(cardData: CardTokenRequest, providerName?: string): Promise<TokenizationResponseDto> {
    this.logger.log('Starting card tokenization');
    
    try {
      const provider = this.getProvider(providerName);
      this.logger.debug(`Using provider: ${providerName || 'default'}`);
      
      const result = await provider.tokenizeCard(cardData);
      
      if (!result.success || !result.data) {
        this.logger.warn('Card tokenization failed', { error: result.error_message });
        throw PaymentProcessorException.tokenizationFailed(
          result.error_message || 'Card tokenization failed'
        );
      }
      
      this.logger.log(`Card tokenized successfully. Token: ${result.data.data.id}`);
      
      return {
        success: true,
        data: {
          tokenId: result.data.data.id,
          lastFour: cardData.number.slice(-4),
          brand: result.data.data.brand || 'UNKNOWN',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Card tokenization error:', error.message);
      
      if (error instanceof PaymentProcessorException) {
        throw error;
      }
      
      throw PaymentProcessorException.tokenizationFailed(
        'Unexpected error during card tokenization',
        { originalError: error.message }
      );
    }
  }

  /**
   * Get merchant information
   */
  async getMerchantInfo(providerName?: string): Promise<MerchantInfoResponseDto> {
    this.logger.log('Retrieving merchant information');
    
    try {
      const provider = this.getProvider(providerName);
      this.logger.debug(`Using provider: ${providerName || 'default'}`);
      
      const result = await provider.getMerchantInfo();
      
      if (!result.success || !result.data) {
        this.logger.warn('Failed to retrieve merchant information', { error: result.error_message });
        throw PaymentProcessorException.merchantInfoUnavailable(
          result.error_message || 'Failed to get merchant information'
        );
      }
      
      this.logger.log('Merchant information retrieved successfully');
      
      return {
        success: true,
        data: {
          acceptanceToken: result.data.data.presigned_acceptance.acceptance_token,
          merchantId: result.data.data.id?.toString() || 'unknown',
          merchantName: result.data.data.name || 'Unknown Merchant',
          tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error retrieving merchant information:', error.message);
      
      if (error instanceof PaymentProcessorException) {
        throw error;
      }
      
      throw PaymentProcessorException.merchantInfoUnavailable(
        'Unexpected error retrieving merchant information'
      );
    }
  }

  /**
   * Generate signature for transaction
   */
  async generateTransactionSignature(
    reference: string,
    amountInCents: number,
    currency: string,
    providerName?: string
  ): Promise<SignatureResponseDto> {
    this.logger.log(`Generating signature for reference: ${reference}`);
    
    try {
      const provider = this.getProvider(providerName);
      this.logger.debug(`Using provider: ${providerName || 'default'}`);
      
      const signature = await provider.generateSignature(reference, amountInCents, currency);
      
      if (!signature) {
        this.logger.warn('Signature generation failed - empty signature returned');
        throw PaymentProcessorException.signatureGenerationFailed(
          'Failed to generate transaction signature'
        );
      }
      
      this.logger.log('Transaction signature generated successfully');
      
      return {
        success: true,
        data: {
          signature,
          algorithm: 'SHA-256',
          signedData: `${reference}|${amountInCents}|${currency}|[INTEGRITY_KEY]`
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Signature generation error:', error.message);
      
      if (error instanceof PaymentProcessorException) {
        throw error;
      }
      
      throw PaymentProcessorException.signatureGenerationFailed(
        'Unexpected error during signature generation'
      );
    }
  }

  /**
   * Get transaction status by ID
   */
  async getTransactionStatus(
    transactionId: string,
    providerName?: string
  ): Promise<{ success: boolean; data?: any; error_message?: string }> {
    this.logger.log(`Getting transaction status for ID: ${transactionId}`);
    
    try {
      const provider = this.getProvider(providerName);
      this.logger.debug(`Using provider: ${providerName || 'default'}`);
      
      const result = await provider.getTransactionStatus(transactionId);
      
      if (!result.success) {
        this.logger.warn('Failed to get transaction status', { 
          transactionId, 
          error: result.error_message 
        });
        return {
          success: false,
          error_message: result.error_message || 'Failed to get transaction status'
        };
      }
      
      this.logger.log('Transaction status retrieved successfully', {
        transactionId,
        status: result.data?.data?.status
      });
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      this.logger.error('Error getting transaction status:', error.message);
      
      return {
        success: false,
        error_message: `Transaction status check failed: ${error.message}`
      };
    }
  }
}
