import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../enums/payment-status.enum';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment unique identifier' })
  id: string;

  @ApiProperty({ description: 'Payment amount in cents' })
  amount_in_cents: number;

  @ApiProperty({ description: 'Currency code', default: 'COP' })
  currency: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  status: string;

  @ApiProperty({ description: 'Payment provider name' })
  provider: string;

  @ApiProperty({ description: 'Provider payment ID', nullable: true })
  provider_payment_id: string | null;

  @ApiProperty({ description: 'Payment URL', nullable: true })
  payment_url: string | null;

  @ApiProperty({ description: 'Payment name', nullable: true })
  name: string | null;

  @ApiProperty({ description: 'Payment description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Single use payment link' })
  single_use: boolean;

  @ApiProperty({ description: 'Collect shipping information' })
  collect_shipping: boolean;

  @ApiProperty({ description: 'Raw provider response', nullable: true })
  raw_response: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;
}