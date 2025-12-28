import { Injectable } from '@nestjs/common';
import { Order, OrderSlaStatus } from '@prisma/client';

@Injectable()
export class OrderSlaService {
  private slotEndMap: Record<string, { hour: number; minute: number }> = {
    '8–11 AM': { hour: 11, minute: 0 },
    '8-11 AM': { hour: 11, minute: 0 },
    '11–2 PM': { hour: 14, minute: 0 },
    '11-2 PM': { hour: 14, minute: 0 },
    '2–5 PM': { hour: 17, minute: 0 },
    '2-5 PM': { hour: 17, minute: 0 },
  };

  private readonly graceMinutes = 30;

  computeSlaStatus(order: Order, deliveredAt: Date): OrderSlaStatus {
    if (!order.scheduledDate || !order.slotLabel) {
      return OrderSlaStatus.NOT_APPLICABLE;
    }

    const mapping = this.slotEndMap[order.slotLabel];
    if (!mapping) {
      return OrderSlaStatus.NOT_APPLICABLE;
    }

    const slotEnd = new Date(order.scheduledDate);
    slotEnd.setHours(mapping.hour, mapping.minute, 0, 0);

    const limit = new Date(slotEnd.getTime() + this.graceMinutes * 60 * 1000);

    return deliveredAt <= limit ? OrderSlaStatus.ON_TIME : OrderSlaStatus.LATE;
  }
}
