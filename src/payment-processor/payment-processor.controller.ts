import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentProcessorService } from './payment-processor.service';
import { PaymentRequestDto, PaymentLinkResponseDto, PaymentStatusResponseDto } from './dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentProcessorController {
  constructor(private readonly paymentProcessorService: PaymentProcessorService) {}

  @Post('create-link')
  @ApiOperation({ summary: 'Create payment link' })
  @ApiResponse({ status: 201, description: 'Payment link created successfully', type: PaymentLinkResponseDto })
  async createPaymentLink(
    @Body() paymentRequest: PaymentRequestDto
  ) {
    return await this.paymentProcessorService.createPaymentLink(paymentRequest);
  }

  @Get('status/:paymentId')
  @ApiOperation({ summary: 'Check payment status' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully', type: PaymentStatusResponseDto })
  async checkPaymentStatus(
    @Param('paymentId') paymentId: string,
    @Query('provider') provider?: string
  ): Promise<PaymentStatusResponseDto> {
    return await this.paymentProcessorService.checkPaymentStatus(paymentId, provider);
  }


  @Get('providers')
  @ApiOperation({ summary: 'Get available payment providers' })
  @ApiResponse({ status: 200, description: 'List of available payment providers' })
  getProviders(): { providers: string[] } {
    return {
      providers: this.paymentProcessorService.getAvailableProviders()
    };
  }
}
