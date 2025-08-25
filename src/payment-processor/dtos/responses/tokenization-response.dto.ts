import { ApiProperty } from '@nestjs/swagger';

export class TokenizationDataDto {
  @ApiProperty({ 
    description: 'Token seguro de la tarjeta', 
    example: 'tok_test_12345abcde' 
  })
  tokenId: string;

  @ApiProperty({ 
    description: 'Últimos 4 dígitos de la tarjeta', 
    example: '4242' 
  })
  lastFour: string;

  @ApiProperty({ 
    description: 'Marca de la tarjeta', 
    example: 'VISA',
    enum: ['VISA', 'MASTERCARD', 'AMEX', 'DINERS']
  })
  brand: string;

  @ApiProperty({ 
    description: 'Fecha de expiración del token', 
    example: '2024-12-31T23:59:59.000Z' 
  })
  expiresAt: string;
}

export class TokenizationResponseDto {
  @ApiProperty({ description: 'Resultado de la tokenización', example: true })
  success: boolean;

  @ApiProperty({ 
    description: 'Datos del token generado', 
    type: TokenizationDataDto,
    required: false 
  })
  data?: TokenizationDataDto;

  @ApiProperty({ 
    description: 'Mensaje de error si la tokenización falló', 
    example: 'Invalid card number format',
    required: false 
  })
  errorMessage?: string;

  @ApiProperty({ 
    description: 'Timestamp de la respuesta', 
    example: '2024-01-15T10:30:00.000Z' 
  })
  timestamp: string;
}