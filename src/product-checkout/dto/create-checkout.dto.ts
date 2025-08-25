import { IsArray, IsNotEmpty, IsOptional, IsNumber, Min, ArrayMinSize, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckoutItemInputDto {
  @ApiProperty({
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Quantity to purchase',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Array of products with their quantities',
    example: [
      { id: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 },
      { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', quantity: 1 }
    ],
    type: [CheckoutItemInputDto]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemInputDto)
  items: CheckoutItemInputDto[];
}