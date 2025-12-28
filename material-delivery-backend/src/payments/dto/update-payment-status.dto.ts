import {IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {PaymentStatus} from '@prisma/client';

export class UpdatePaymentStatusDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsString()
  providerPaymentId?: string;
}
