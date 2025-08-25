import { ApiProperty } from '@nestjs/swagger';

export class MerchantDataDto {
  @ApiProperty({ 
    description: 'Token de aceptación del comercio', 
    example: 'eyJhbGciOiJIUzI1NiJ9...' 
  })
  acceptanceToken: string;

  @ApiProperty({ 
    description: 'ID del comercio', 
    example: 'merchant_12345' 
  })
  merchantId: string;

  @ApiProperty({ 
    description: 'Nombre del comercio', 
    example: 'Mi Tienda Online' 
  })
  merchantName: string;

  @ApiProperty({ 
    description: 'Fecha de expiración del token', 
    example: '2024-01-15T15:30:00.000Z' 
  })
  tokenExpiresAt: string;
}

export class MerchantInfoResponseDto {
  @ApiProperty({ description: 'Resultado de la consulta', example: true })
  success: boolean;

  @ApiProperty({ 
    description: 'Información del comercio', 
    type: MerchantDataDto,
    required: false 
  })
  data?: MerchantDataDto;

  @ApiProperty({ 
    description: 'Mensaje de error si la consulta falló', 
    example: 'Unable to retrieve merchant information',
    required: false 
  })
  errorMessage?: string;

  @ApiProperty({ 
    description: 'Timestamp de la respuesta', 
    example: '2024-01-15T10:30:00.000Z' 
  })
  timestamp: string;
}