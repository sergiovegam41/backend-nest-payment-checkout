import { PartialType } from '@nestjs/swagger';
import { CreatePaymentProcessorDto } from './create-payment-processor.dto';

export class UpdatePaymentProcessorDto extends PartialType(CreatePaymentProcessorDto) {}
