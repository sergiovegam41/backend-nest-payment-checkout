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
    description: 'Subtotal in cents (before taxes)',
    example: 259800
  })
  subtotal: number;

  @ApiProperty({
    description: 'Tax amount in cents',
    example: 49362
  })
  taxes: number;

  @ApiProperty({
    description: 'Total amount in cents (subtotal + taxes)',
    example: 309162
  })
  total: number;

  @ApiProperty({
    description: 'Payment URL from payment processor',
    example: 'https://checkout.wompi.co/abc123'
  })
  payment_url: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'COP'
  })
  currency: string;
}