import { ApiProperty } from '@nestjs/swagger';

export class CheckoutItemDto {
  @ApiProperty({
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  product_id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro'
  })
  name: string;

  @ApiProperty({
    description: 'Unit price in cents',
    example: 129900
  })
  unit_price: number;

  @ApiProperty({
    description: 'Quantity',
    example: 2
  })
  quantity: number;

  @ApiProperty({
    description: 'Total price for this item in cents',
    example: 259800
  })
  total_price: number;
}

export class PaymentMethodInfoDto {
  @ApiProperty({
    description: 'Payment method type',
    example: 'CARD'
  })
  type: string;

  @ApiProperty({
    description: 'Last four digits of card',
    example: '4242'
  })
  last_four: string;

  @ApiProperty({
    description: 'Card holder name',
    example: 'Test User'
  })
  card_holder: string;

  @ApiProperty({
    description: 'Card brand',
    example: 'VISA',
    required: false
  })
  brand?: string;
}

export class CheckoutResponseDto {
  @ApiProperty({
    description: 'Checkout UUID for tracking',
    example: '7ba7b810-9dad-11d1-80b4-00c04fd430c8'
  })
  checkout_id: string;

  @ApiProperty({
    description: 'Items in the checkout',
    type: [CheckoutItemDto]
  })
  items: CheckoutItemDto[];

  @ApiProperty({
    description: 'Subtotal in pesos (before taxes)',
    example: 2598
  })
  subtotal: number;

  @ApiProperty({
    description: 'Tax amount in pesos',
    example: 494
  })
  taxes: number;

  @ApiProperty({
    description: 'Total amount in pesos (subtotal + taxes)',
    example: 3092
  })
  total: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'COP'
  })
  currency: string;

  @ApiProperty({
    description: 'Transaction ID from payment processor',
    example: 'wompi-trans-123',
    required: false
  })
  transaction_id?: string;

  @ApiProperty({
    description: 'Transaction status',
    example: 'APPROVED',
    enum: ['APPROVED', 'DECLINED', 'PENDING', 'ERROR'],
    required: false
  })
  transaction_status?: string;

  @ApiProperty({
    description: 'Payment method information',
    type: PaymentMethodInfoDto,
    required: false
  })
  payment_method_info?: PaymentMethodInfoDto;

  // Deprecated - kept for backward compatibility
  @ApiProperty({
    description: 'Payment URL (deprecated - use transaction fields instead)',
    example: 'https://checkout.wompi.co/abc123',
    required: false
  })
  payment_url?: string;
}