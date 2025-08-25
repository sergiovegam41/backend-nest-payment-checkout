import { HttpException, HttpStatus } from '@nestjs/common';

export enum PaymentErrorCode {
  // Tokenization errors
  TOKENIZATION_FAILED = 'TOKENIZATION_FAILED',
  INVALID_CARD_DATA = 'INVALID_CARD_DATA',
  
  // Transaction errors
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_DECLINED = 'TRANSACTION_DECLINED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  
  // Provider errors
  PROVIDER_NOT_AVAILABLE = 'PROVIDER_NOT_AVAILABLE',
  PROVIDER_CONFIGURATION_ERROR = 'PROVIDER_CONFIGURATION_ERROR',
  
  // Merchant errors
  MERCHANT_INFO_UNAVAILABLE = 'MERCHANT_INFO_UNAVAILABLE',
  INVALID_MERCHANT_CONFIG = 'INVALID_MERCHANT_CONFIG',
  
  // Signature errors
  SIGNATURE_GENERATION_FAILED = 'SIGNATURE_GENERATION_FAILED',
  INVALID_SIGNATURE_DATA = 'INVALID_SIGNATURE_DATA',
  
  // General errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class PaymentProcessorException extends HttpException {
  constructor(
    public readonly errorCode: PaymentErrorCode,
    public readonly message: string,
    public readonly details?: any,
    public readonly httpStatus: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super(
      {
        success: false,
        error: {
          code: errorCode,
          message,
          details
        },
        timestamp: new Date().toISOString()
      },
      httpStatus
    );
  }

  static tokenizationFailed(message: string, details?: any): PaymentProcessorException {
    return new PaymentProcessorException(
      PaymentErrorCode.TOKENIZATION_FAILED,
      message,
      details,
      HttpStatus.BAD_REQUEST
    );
  }

  static transactionFailed(message: string, details?: any): PaymentProcessorException {
    return new PaymentProcessorException(
      PaymentErrorCode.TRANSACTION_FAILED,
      message,
      details,
      HttpStatus.BAD_REQUEST
    );
  }

  static transactionDeclined(message: string, details?: any): PaymentProcessorException {
    return new PaymentProcessorException(
      PaymentErrorCode.TRANSACTION_DECLINED,
      message,
      details,
      HttpStatus.PAYMENT_REQUIRED
    );
  }

  static providerNotAvailable(provider: string): PaymentProcessorException {
    return new PaymentProcessorException(
      PaymentErrorCode.PROVIDER_NOT_AVAILABLE,
      `Payment provider ${provider} is not available`,
      { provider },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }

  static merchantInfoUnavailable(message: string): PaymentProcessorException {
    return new PaymentProcessorException(
      PaymentErrorCode.MERCHANT_INFO_UNAVAILABLE,
      message,
      undefined,
      HttpStatus.BAD_REQUEST
    );
  }

  static signatureGenerationFailed(message: string): PaymentProcessorException {
    return new PaymentProcessorException(
      PaymentErrorCode.SIGNATURE_GENERATION_FAILED,
      message,
      undefined,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  static validationError(message: string, details?: any): PaymentProcessorException {
    return new PaymentProcessorException(
      PaymentErrorCode.VALIDATION_ERROR,
      message,
      details,
      HttpStatus.BAD_REQUEST
    );
  }

  static networkError(message: string): PaymentProcessorException {
    return new PaymentProcessorException(
      PaymentErrorCode.NETWORK_ERROR,
      message,
      undefined,
      HttpStatus.BAD_GATEWAY
    );
  }
}