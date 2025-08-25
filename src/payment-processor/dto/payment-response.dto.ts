import { ApiProperty } from '@nestjs/swagger';

export class PaymentLinkResponseDto {
  @ApiProperty({ description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ description: 'Payment link ID from provider' })
  payment_id: string | null;

  @ApiProperty({ description: 'Full payment URL' })
  payment_url: string | null;

  @ApiProperty({ description: 'Error message if any' })
  error_message?: string;

  constructor(
    success: boolean,
    payment_id: string | null = null,
    payment_url: string | null = null,
    error_message?: string
  ) {
    this.success = success;
    this.payment_id = payment_id;
    this.payment_url = payment_url;
    this.error_message = error_message;
  }
}

export class PaymentStatusResponseDto {
  @ApiProperty({ description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ description: 'Payment status' })
  status: string | null;

  @ApiProperty({ description: 'Payment link ID' })
  payment_id: string | null;

  @ApiProperty({ description: 'Raw provider response' })
  raw_response: string;

  @ApiProperty({ description: 'Error message if any' })
  error_message?: string;

  constructor(
    success: boolean,
    status: string | null = null,
    payment_id: string | null = null,
    raw_response: string = '',
    error_message?: string
  ) {
    this.success = success;
    this.status = status;
    this.payment_id = payment_id;
    this.raw_response = raw_response;
    this.error_message = error_message;
  }
}