import {Injectable, Logger, Optional} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InjectQueue} from '@nestjs/bullmq';
import {Queue} from 'bullmq';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  Order,
  OrderStatus,
  User,
  UserRole,
} from '@prisma/client';
import {PrismaService} from '../prisma/prisma.service';
import twilio, {Twilio} from 'twilio';

interface SendSmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly enabled: boolean;
  private twilioClient: Twilio | null = null;
  private twilioFromNumber: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Optional() @InjectQueue('notifications') private readonly notificationsQueue?: Queue,
  ) {
    this.enabled = this.config.get<boolean>('notifications.enabled') ?? false;

    const accountSid = this.config.get<string>('notifications.twilioAccountSid');
    const authToken = this.config.get<string>('notifications.twilioAuthToken');
    const fromNumber = this.config.get<string>('notifications.twilioFromNumber');

    if (this.enabled && accountSid && authToken && fromNumber) {
      this.twilioClient = twilio(accountSid, authToken);
      this.twilioFromNumber = fromNumber;
      this.logger.log('Twilio SMS provider initialized');
    } else if (this.enabled) {
      this.logger.log('Notifications enabled but Twilio not fully configured. SMS will be logged only.');
    }
  }

  private get queueEnabled(): boolean {
    return (this.config.get<boolean>('queue.enabled') ?? false) && !!this.notificationsQueue;
  }

  async sendSms({to, message}: SendSmsOptions): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`Notifications disabled. Would send SMS to ${to}: ${message}`);
      return;
    }

    if (!this.twilioClient || !this.twilioFromNumber) {
      this.logger.log(`[SMS-LOG] To ${to}: ${message}`);
      return;
    }

    try {
      const res = await this.twilioClient.messages.create({
        from: this.twilioFromNumber,
        to,
        body: message,
      });
      this.logger.log(`Sent SMS to ${to}. Twilio SID: ${res.sid}`);
    } catch (err) {
      this.logger.error(`Failed to send SMS via Twilio to ${to}: ${err}`);
    }
  }

  async sendOrderPlaced(params: {
    customerPhone?: string | null;
    orderCode: string;
    cityName?: string | null;
    totalAmount?: number | null;
  }): Promise<void> {
    if (!params.customerPhone) return;
    const message =
      `Your order ${params.orderCode} has been placed` +
      (params.cityName ? ` for ${params.cityName}` : '') +
      (params.totalAmount != null ? `, amount ₹${params.totalAmount}` : '') +
      `. We will notify you as the status changes.`;

    await this.sendSms({to: params.customerPhone, message});
  }

  async sendOrderStatusChanged(params: {
    customerPhone?: string | null;
    orderCode: string;
    newStatus: OrderStatus;
  }): Promise<void> {
    if (!params.customerPhone) return;

    const statusTextMap: Record<OrderStatus, string> = {
      PLACED: 'placed',
      ACCEPTED: 'accepted by supplier',
      DISPATCHED: 'dispatched from the plant',
      DELIVERED: 'delivered at site',
      CANCELLED: 'cancelled',
    };

    const readable = statusTextMap[params.newStatus] ?? params.newStatus.toLowerCase();
    const message = `Status update for order ${params.orderCode}: ${readable}.`;

    await this.sendSms({to: params.customerPhone, message});
  }

  async createInAppNotification(params: {
    userId: string;
    role?: UserRole;
    type: NotificationType;
    title: string;
    body: string;
    orderId?: string;
    data?: any;
  }): Promise<void> {
    const {userId, role, type, title, body, orderId, data} = params;

    await this.prisma.notification.create({
      data: {
        userId,
        role: role ?? null,
        type,
        channel: NotificationChannel.IN_APP,
        status: NotificationStatus.SENT,
        title,
        body,
        orderId: orderId ?? null,
        data: data ? (data as any) : undefined,
      },
    });
  }

  async notifyOrderPlaced(
    order: Order & {
      customer: {user: User | null} | null;
      supplier: {user: User | null} | null;
    },
  ) {
    const orderCode = order.orderCode;

    const customerUser = order.customer?.user ?? null;
    const supplierUser = order.supplier?.user ?? null;

    if (customerUser) {
      await this.createInAppNotification({
        userId: customerUser.id,
        role: UserRole.CUSTOMER,
        type: NotificationType.ORDER_PLACED,
        title: 'Order placed',
        body: `Your order ${orderCode} has been placed.`,
        orderId: order.id,
      });

      if (this.queueEnabled && this.notificationsQueue) {
        await this.notificationsQueue.add('orderPlacedSms', {
          jobType: 'orderPlacedSms',
          payload: {
            customerPhone: customerUser.phone,
            orderCode,
            totalAmount: Number(order.totalAmount),
          },
        });
      } else {
        await this.sendOrderPlaced({
          customerPhone: customerUser.phone,
          orderCode,
          cityName: undefined,
          totalAmount: Number(order.totalAmount),
        }).catch(() => undefined);
      }
    }

    if (supplierUser) {
      await this.createInAppNotification({
        userId: supplierUser.id,
        role: UserRole.SUPPLIER,
        type: NotificationType.ORDER_PLACED,
        title: 'New order received',
        body: `You have received order ${orderCode}.`,
        orderId: order.id,
      });
      // SMS to supplier can be added later if needed
    }
  }

  async notifyOrderStatusChanged(
    order: Order & {customer: {user: User | null} | null},
    newStatus: OrderStatus,
  ) {
    const customerUser = order.customer?.user ?? null;
    if (!customerUser) return;

    const readable =
      newStatus === OrderStatus.PLACED
        ? 'placed'
        : newStatus === OrderStatus.ACCEPTED
        ? 'accepted by supplier'
        : newStatus === OrderStatus.DISPATCHED
        ? 'dispatched from plant'
        : newStatus === OrderStatus.DELIVERED
        ? 'delivered at site'
        : 'cancelled';

    await this.createInAppNotification({
      userId: customerUser.id,
      role: UserRole.CUSTOMER,
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: 'Order status updated',
      body: `Status of order ${order.orderCode} is now ${readable}.`,
      orderId: order.id,
    });

    if (this.queueEnabled && this.notificationsQueue) {
      await this.notificationsQueue.add('orderStatusSms', {
        jobType: 'orderStatusSms',
        payload: {
          customerPhone: customerUser.phone,
          orderCode: order.orderCode,
          newStatus,
        },
      });
    } else {
      await this.sendOrderStatusChanged({
        customerPhone: customerUser.phone,
        orderCode: order.orderCode,
        newStatus,
      }).catch(() => undefined);
    }
  }
}

export type {SendSmsOptions};
