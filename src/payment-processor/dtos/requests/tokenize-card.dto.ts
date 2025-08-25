import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenizeCardDto {
  @ApiProperty({ 
    description: 'Número de tarjeta (16 dígitos)', 
    example: '4242424242424242',
    minLength: 16,
    maxLength: 19
  })
  @IsString()
  number: string;

  @ApiProperty({ 
    description: 'Mes de expiración (2 dígitos)', 
    example: '12',
    minLength: 2,
    maxLength: 2
  })
  @IsString()
  exp_month: string;

  @ApiProperty({ 
    description: 'Año de expiración (2 dígitos)', 
    example: '29',
    minLength: 2,
    maxLength: 2
  })
  @IsString()
  exp_year: string;

  @ApiProperty({ 
    description: 'Código de seguridad CVC (3 dígitos)', 
    example: '123',
    minLength: 3,
    maxLength: 4
  })
  @IsString()
  cvc: string;

  @ApiProperty({ 
    description: 'Nombre del titular de la tarjeta', 
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  card_holder: string;
}