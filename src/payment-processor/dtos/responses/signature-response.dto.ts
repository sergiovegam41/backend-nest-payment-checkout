import { ApiProperty } from '@nestjs/swagger';

export class SignatureDataDto {
  @ApiProperty({ 
    description: 'Firma SHA-256 generada', 
    example: '6b3c8d41d834f842e31be7755ae56ef359fc3f2f097555fab00efcbc4bc4647f' 
  })
  signature: string;

  @ApiProperty({ 
    description: 'Algoritmo utilizado para la firma', 
    example: 'SHA-256' 
  })
  algorithm: string;

  @ApiProperty({ 
    description: 'Datos utilizados para generar la firma', 
    example: 'checkout-123|150000|COP|integrity_key_here' 
  })
  signedData: string;
}

export class SignatureResponseDto {
  @ApiProperty({ description: 'Resultado de la generación', example: true })
  success: boolean;

  @ApiProperty({ 
    description: 'Datos de la firma generada', 
    type: SignatureDataDto,
    required: false 
  })
  data?: SignatureDataDto;

  @ApiProperty({ 
    description: 'Mensaje de error si la generación falló', 
    example: 'Missing integrity key for signature generation',
    required: false 
  })
  errorMessage?: string;

  @ApiProperty({ 
    description: 'Timestamp de la respuesta', 
    example: '2024-01-15T10:30:00.000Z' 
  })
  timestamp: string;
}