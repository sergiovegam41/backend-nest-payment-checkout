import { ApiProperty } from '@nestjs/swagger';
import { CheckoutStatus } from '@prisma/client';

export class CheckoutStatusItemDto {
  @ApiProperty({
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  product_id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro'
  })
  product_name: string;

  @ApiProperty({
    description: 'Quantity purchased',
    example: 2
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit price in cents at time of purchase',
    example: 129900
  })
  unit_price: number;

  @ApiProperty({
    description: 'Total price for this item in cents',
    example: 259800
  })
  total_price: number;
}

export class CheckoutStatusResponseDto {
  @ApiProperty({
    description: 'Checkout UUID',
    example: '7ba7b810-9dad-11d1-80b4-00c04fd430c8'
  })
  checkout_id: string;

  @ApiProperty({
    description: 'Current checkout status',
    enum: CheckoutStatus,
    example: CheckoutStatus.PENDING
  })
  status: CheckoutStatus;

  @ApiProperty({
    description: 'Total amount in cents',
    example: 309162
  })
  total: number;

  @ApiProperty({
    description: 'Subtotal in cents',
    example: 259800
  })
  subtotal: number;

  @ApiProperty({
    description: 'Tax amount in cents',
    example: 49362
  })
  taxes: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'COP'
  })
  currency: string;

  @ApiProperty({
    description: 'Payment URL (if available)',
    example: 'https://checkout.wompi.co/abc123',
    required: false
  })
  payment_url?: string;

  @ApiProperty({
    description: 'Provider payment ID (if available)',
    example: 'wompi-payment-123',
    required: false
  })
  provider_payment_id?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  created_at: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z'
  })
  updated_at: string;

  @ApiProperty({
    description: 'Payment completion timestamp',
    example: '2024-01-15T10:35:00.000Z',
    required: false
  })
  paid_at?: string;

  @ApiProperty({
    description: 'Items in the checkout',
    type: [CheckoutStatusItemDto]
  })
  items: CheckoutStatusItemDto[];
}