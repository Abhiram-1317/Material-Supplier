import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {PaymentMethod, PaymentStatus, UserRole} from '@prisma/client';
import type {Request} from 'express';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {PaymentsService} from './payments.service';
import {CreatePaymentIntentDto} from './dto/create-payment-intent.dto';
import {UpdatePaymentStatusDto} from './dto/update-payment-status.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  private getUserId(req: Request): string {
    const user = (req as any).user as {sub?: string} | undefined;
    return user?.sub as string;
  }

  @Post('intent')
  @Roles(UserRole.CUSTOMER)
  createIntent(@Req() req: Request, @Body() dto: CreatePaymentIntentDto) {
    const userId = this.getUserId(req);
    return this.paymentsService.createPaymentIntentForOrder(
      userId,
      dto.orderId,
      dto.paymentMethod ?? PaymentMethod.UPI,
    );
  }

  @Post('status')
  @Roles(UserRole.CUSTOMER)
  updateStatus(@Req() req: Request, @Body() dto: UpdatePaymentStatusDto) {
    const userId = this.getUserId(req);
    return this.paymentsService.updatePaymentStatusFromClient(
      userId,
      dto.orderId,
      dto.status as PaymentStatus,
    );
  }
}
