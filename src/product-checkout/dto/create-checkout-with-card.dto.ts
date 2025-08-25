import { IsEmail, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCheckoutDto } from './create-checkout.dto';

/**
 * DTO for card data from frontend
 */
class CardDataDto {
  @ApiProperty({
    description: 'Card number',
    example: '4242424242424242'
  })
  @IsString()
  number: string;

  @ApiProperty({
    description: 'Card expiration month',
    example: '12'
  })
  @IsString()
  exp_month: string;

  @ApiProperty({
    description: 'Card expiration year',
    example: '29'
  })
  @IsString()
  exp_year: string;

  @ApiProperty({
    description: 'Card CVC/CVV',
    example: '123'
  })
  @IsString()
  cvc: string;

  @ApiProperty({
    description: 'Card holder name',
    example: 'Pedro Perez'
  })
  @IsString()
  card_holder: string;
}

/**
 * DTO for creating checkout with card payment
 * Extends base checkout functionality with direct card payment
 */
export class CreateCheckoutWithCardDto extends CreateCheckoutDto {
  @ApiProperty({
    description: 'Customer email for transaction',
    example: 'cliente@ejemplo.com'
  })
  @IsEmail()
  customer_email: string;

  @ApiProperty({
    description: 'Card data for payment',
    type: CardDataDto
  })
  @ValidateNested()
  @Type(() => CardDataDto)
  card_data: CardDataDto;
}