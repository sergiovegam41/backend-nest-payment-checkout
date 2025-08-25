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
    summary: 'Create product checkout',
    description: 'Creates a checkout session for selected products and returns payment URL'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkout created successfully', 
    type: CheckoutResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'One or more products not found'
  })
  async createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto
  ): Promise<CheckoutResponseDto> {
    return await this.productCheckoutService.createCheckout(createCheckoutDto);
  }

  @Post('with-card')
  @ApiOperation({ 
    summary: 'Create checkout and process payment with card',
    description: 'Creates a checkout session and immediately processes payment with provided card data using direct transaction'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkout and payment processed successfully', 
    type: CheckoutResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed or payment processing failed'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'One or more products not found'
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