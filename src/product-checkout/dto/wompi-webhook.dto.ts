import { IsString, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WompiTransactionDto {
  @ApiProperty({
    description: 'Transaction ID from Wompi',
    example: 'wompi-transaction-123'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Transaction status',
    example: 'APPROVED'
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Transaction reference (our checkout ID)',
    example: '7ba7b810-9dad-11d1-80b4-00c04fd430c8'
  })
  @IsString()
  reference: string;

  @ApiProperty({
    description: 'Amount in cents',
    example: 309162
  })
  amount_in_cents: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'COP'
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Payment method information',
    required: false
  })
  @IsOptional()
  @IsObject()
  payment_method?: any;

  @ApiProperty({
    description: 'Additional transaction data',
    required: false
  })
  @IsOptional()
  @IsObject()
  payment_source_id?: string;
}

export class WompiWebhookDataDto {
  @ApiProperty({
    description: 'Transaction details',
    type: WompiTransactionDto
  })
  @ValidateNested()
  @Type(() => WompiTransactionDto)
  transaction: WompiTransactionDto;
}

export class WompiWebhookDto {
  @ApiProperty({
    description: 'Event type from Wompi',
    example: 'transaction.updated'
  })
  @IsString()
  event: string;

  @ApiProperty({
    description: 'Event data containing transaction info',
    type: WompiWebhookDataDto
  })
  @ValidateNested()
  @Type(() => WompiWebhookDataDto)
  data: WompiWebhookDataDto;

  @ApiProperty({
    description: 'Environment from Wompi',
    example: 'test',
    required: false
  })
  @IsOptional()
  @IsString()
  environment?: string;

  @ApiProperty({
    description: 'Timestamp from Wompi',
    example: '2024-01-15T10:35:00Z',
    required: false
  })
  @IsOptional()
  @IsString()
  sent_at?: string;
}