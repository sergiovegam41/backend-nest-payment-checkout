import { IsNumber, IsString, IsOptional, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentRequestDto {
  @ApiProperty({ 
    description: 'Payment amount in cents (subunit)',
    example: 50000,
    minimum: 1 
  })
  @IsNumber()
  @Min(1)
  amount_in_cents: number;

  @ApiProperty({ 
    description: 'Currency code',
    example: 'COP',
    default: 'COP' 
  })
  @IsString()
  @IsOptional()
  currency?: string = 'COP';

  @ApiProperty({ 
    description: 'Payment description',
    example: 'Payment for products in our online store' 
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Payment name/title',
    example: 'Payment for your purchase in our store' 
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'Single use payment link',
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  single_use?: boolean = true;

  @ApiProperty({ 
    description: 'Collect shipping information',
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  collect_shipping?: boolean = false;
}