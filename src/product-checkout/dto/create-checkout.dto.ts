import { IsArray, IsNotEmpty, IsOptional, IsNumber, Min, ArrayMinSize, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Array of product UUIDs to purchase',
    example: ['550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8'],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  product_ids: string[];

  @ApiProperty({
    description: 'Array of quantities for each product (optional, defaults to 1 for each)',
    example: [2, 1],
    type: [Number],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  quantities?: number[];
}