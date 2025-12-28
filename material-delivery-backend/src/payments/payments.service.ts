import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * STEP 1: Create payment intent (ONLY creates PENDING payment)
   * Client can call this
   */
  async createPaymentIntentForOrder(
    customerUserId: string,
    orderId: string,
    method: PaymentMethod = PaymentMethod.UPI,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const customer = await this.prisma.customer.findUnique({
      where: { userId: customerUserId },
    });
    if (!customer || order.customerId !== customer.id) {
      throw new ForbiddenException('You cannot pay for this order');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    const currency =
      this.config.get<string>('payment.defaultCurrency') ?? 'INR';

    let upiDeepLink: string | null = null;

    // ----------- UPI HANDLING -----------
    if (method === PaymentMethod.UPI) {
      const upiVpa = this.config.get<string>('upi.vpa');
      const upiName = this.config.get<string>('upi.name') ?? 'Business';

      if (!upiVpa) throw new BadRequestException('UPI not configured');

      const amount = order.totalAmount.toNumber();

      upiDeepLink = `upi://pay?pa=${encodeURIComponent(
        upiVpa,
      )}&pn=${encodeURIComponent(
        upiName,
      )}&am=${amount.toFixed(
        2,
      )}&cu=INR&tn=${encodeURIComponent(order.orderCode)}`;
    }

    // ----------- TRANSACTION (ATOMIC) -----------
    const [payment] = await this.prisma.$transaction([
      this.prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          order: { connect: { id: order.id } },
          provider: method === PaymentMethod.UPI ? 'UPI' : 'RAZORPAY',
          amount: order.totalAmount,
          currency,
          status: PaymentStatus.PENDING,
          upiDeepLink,
        },
        update: {
          amount: order.totalAmount,
          status: PaymentStatus.PENDING,
          provider: method === PaymentMethod.UPI ? 'UPI' : 'RAZORPAY',
          currency,
          upiDeepLink,
        },
      }),

      this.prisma.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: method,
          paymentStatus: PaymentStatus.PENDING,
        },
      }),
    ]);

    return {
      paymentId: payment.id,
      orderId: order.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: method,
      provider: payment.provider,
      upiDeepLink: payment.upiDeepLink,
    };
  }

  /**
   * STEP 2: Client can ONLY mark FAILED or keep PENDING
   * ❌ Client can NEVER mark PAID
   */
  async updatePaymentStatusFromClient(
    customerUserId: string,
    orderId: string,
    status: PaymentStatus,
  ) {
    const allowed: PaymentStatus[] = [
      PaymentStatus.FAILED,
      PaymentStatus.PENDING,
    ];
    if (!allowed.includes(status)) {
      throw new ForbiddenException(
        'Client cannot set this payment status',
      );
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const customer = await this.prisma.customer.findUnique({
      where: { userId: customerUserId },
    });
    if (!customer || order.customerId !== customer.id) {
      throw new ForbiddenException('Unauthorized');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Payment already completed');
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: status },
      }),
    ]);

    return { success: true };
  }

  /**
   * STEP 3: BACKEND-ONLY
   * Called from Razorpay webhook / payment verification
   */
  async markPaymentAsPaid(
    orderId: string,
    providerPaymentId: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === PaymentStatus.PAID) return;

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          providerPaymentId,
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      }),
    ]);
  }
}
