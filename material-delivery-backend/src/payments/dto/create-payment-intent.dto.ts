import {PaymentMethod} from '@prisma/client';
import {IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
