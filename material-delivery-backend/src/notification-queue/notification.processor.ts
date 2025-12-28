import {Processor, WorkerHost, OnWorkerEvent} from '@nestjs/bullmq';
import {Job} from 'bullmq';
import {Injectable, Logger} from '@nestjs/common';
import {NotificationsService} from '../notifications/notifications.service';

 type OrderSmsJob =
  | {
      jobType: 'orderPlacedSms';
      payload: {
        customerPhone?: string | null;
        orderCode: string;
        totalAmount?: number;
      };
    }
  | {
      jobType: 'orderStatusSms';
      payload: {
        customerPhone?: string | null;
        orderCode: string;
        newStatus: string;
      };
    };

@Processor('notifications')
@Injectable()
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<OrderSmsJob, any, string>): Promise<void> {
    const {jobType, payload} = job.data;

    try {
      if (jobType === 'orderPlacedSms') {
        await this.notificationsService.sendOrderPlaced({
          customerPhone: payload.customerPhone ?? null,
          orderCode: payload.orderCode,
          totalAmount: payload.totalAmount,
        });
      } else if (jobType === 'orderStatusSms') {
        await this.notificationsService.sendOrderStatusChanged({
          customerPhone: payload.customerPhone ?? null,
          orderCode: payload.orderCode,
          newStatus: payload.newStatus as any,
        });
      }
    } catch (e) {
      this.logger.error(`Failed to process notification job ${jobType}`, e as any);
      throw e;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Notification job failed: ${job.id} ${err.message}`);
  }
}
