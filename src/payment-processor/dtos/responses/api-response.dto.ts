import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ description: 'Código de error', example: 'PAYMENT_FAILED' })
  code: string;

  @ApiProperty({ description: 'Mensaje de error', example: 'La transacción falló' })
  message: string;

  @ApiProperty({ 
    description: 'Detalles adicionales del error (opcional)', 
    required: false,
    example: { field: 'card_number', reason: 'invalid_format' }
  })
  details?: any;
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Indica si la operación fue exitosa', example: true })
  success: boolean;

  @ApiProperty({ description: 'Datos de respuesta (cuando success = true)', required: false })
  data?: T;

  @ApiProperty({ 
    description: 'Información del error (cuando success = false)', 
    type: ApiErrorDto,
    required: false 
  })
  error?: ApiErrorDto;

  @ApiProperty({ 
    description: 'Timestamp de la respuesta', 
    example: '2024-01-15T10:30:00.000Z' 
  })
  timestamp: string;

  @ApiProperty({ 
    description: 'ID único de la request para tracking', 
    example: 'req_123456789',
    required: false 
  })
  requestId?: string;
}