import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductCheckoutService } from './services/product-checkout.service';
import { CreateCheckoutDto, CreateCheckoutWithCardDto, CheckoutResponseDto, CheckoutStatusResponseDto, WompiWebhookDto } from './dto';

@ApiTags('product-checkout')
@Controller('product-checkout')
export class ProductCheckoutController {
  constructor(private readonly productCheckoutService: ProductCheckoutService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear checkout de productos - Create product checkout',
    description: `
    Crea una sesión de checkout para productos seleccionados y retorna URL de pago.
    
    **Formato de entrada:**
    - \`items\`: Array de objetos con \`id\` (UUID del producto) y \`quantity\` (cantidad)
    - Cada producto debe existir y tener stock suficiente
    
    **Ejemplo:**
    \`\`\`json
    {
      "items": [
        { "id": "550e8400-e29b-41d4-a716-446655440000", "quantity": 2 },
        { "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "quantity": 1 }
      ]
    }
    \`\`\`
    `
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkout creado exitosamente - Checkout created successfully', 
    type: CheckoutResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solicitud incorrecta - Validación fallida o productos no encontrados'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Uno o más productos no encontrados - One or more products not found'
  })
  async createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto
  ): Promise<CheckoutResponseDto> {
    return await this.productCheckoutService.createCheckout(createCheckoutDto);
  }

  @Post('with-card')
  @ApiOperation({ 
    summary: 'Crear checkout y procesar pago con tarjeta - Create checkout and process payment with card',
    description: `
    Crea una sesión de checkout y procesa el pago inmediatamente con los datos de tarjeta proporcionados usando transacción directa.
    
    **Formato de entrada:**
    - \`items\`: Array de productos con cantidades (igual que el endpoint básico)
    - \`customer_email\`: Email del cliente (requerido)
    - \`card_data\`: Datos de la tarjeta de crédito/débito
    
    **Ejemplo:**
    \`\`\`json
    {
      "items": [
        { "id": "550e8400-e29b-41d4-a716-446655440000", "quantity": 2 }
      ],
      "customer_email": "cliente@ejemplo.com",
      "card_data": {
        "number": "4242424242424242",
        "exp_month": "12",
        "exp_year": "29",
        "cvc": "123",
        "card_holder": "Juan Pérez"
      }
    }
    \`\`\`
    
    **Notas importantes:**
    - El año de expiración debe estar en formato de 2 dígitos (29 para 2029)
    - El número de tarjeta 4242424242424242 es para testing en sandbox
    - El resultado incluye el estado de la transacción inmediatamente
    `
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkout y pago procesados exitosamente - Checkout and payment processed successfully', 
    type: CheckoutResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solicitud incorrecta - Validación fallida, procesamiento de pago fallido o productos no encontrados'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Uno o más productos no encontrados - One or more products not found'
  })
  async createCheckoutWithCard(
    @Body() createCheckoutDto: CreateCheckoutWithCardDto
  ): Promise<CheckoutResponseDto> {
    return await this.productCheckoutService.createCheckoutWithCard(createCheckoutDto);
  }

  @Get(':checkout_id/status')
  @ApiOperation({ 
    summary: 'Get checkout status',
    description: 'Retrieves the current status and details of a checkout'
  })
  @ApiParam({
    name: 'checkout_id',
    description: 'Checkout UUID',
    example: '7ba7b810-9dad-11d1-80b4-00c04fd430c8'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Checkout status retrieved successfully', 
    type: CheckoutStatusResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Checkout not found'
  })
  async getCheckoutStatus(
    @Param('checkout_id') checkoutId: string
  ): Promise<CheckoutStatusResponseDto> {
    return await this.productCheckoutService.getCheckoutStatus(checkoutId);
  }

  @Post('webhook/wompi')
  @ApiOperation({ 
    summary: 'Wompi webhook handler',
    description: 'Receives payment status updates from Wompi'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Webhook processing failed'
  })
  async handleWompiWebhook(
    @Body() webhook: WompiWebhookDto
  ): Promise<{ success: boolean; message: string }> {
    return await this.productCheckoutService.handleWompiWebhook(webhook);
  }
}