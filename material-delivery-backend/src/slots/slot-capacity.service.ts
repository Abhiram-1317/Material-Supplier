/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ParsedSlotInfo {
  scheduledDate: Date;
  slotLabel: string;
}

@Injectable()
export class SlotCapacityService {
  constructor(private readonly prisma: PrismaService) {}

  // Parse a scheduledSlot string like "Today, 8–11 AM" or "Tomorrow, 2–5 PM"
  parseScheduledSlot(raw: string): ParsedSlotInfo {
    if (!raw) {
      throw new BadRequestException('Scheduled slot is required');
    }

    const parts = raw.split(',');
    if (parts.length < 2) {
      throw new BadRequestException('Invalid scheduled slot format');
    }

    const dayPart = parts[0].trim().toLowerCase();
    const slotLabel = parts.slice(1).join(',').trim();

    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let offsetDays = 0;
    if (dayPart.includes('tomorrow')) {
      offsetDays = 1;
    } else if (!dayPart.includes('today')) {
      throw new BadRequestException('Unsupported day in scheduled slot');
    }

    const scheduledDate = new Date(base);
    scheduledDate.setDate(base.getDate() + offsetDays);

    return { scheduledDate, slotLabel };
  }

  // Ensure capacity for supplier + slot; returns ParsedSlotInfo to be saved on Order
  async ensureCapacityOrThrow(
    supplierId: string,
    scheduledSlot: string,
  ): Promise<ParsedSlotInfo> {
    const { scheduledDate, slotLabel } = this.parseScheduledSlot(scheduledSlot);

    const config = await this.prisma.supplierSlotConfig.findUnique({
      where: { supplierId_label: { supplierId, label: slotLabel } },
    });

    if (!config || !config.isActive) {
      return { scheduledDate, slotLabel };
    }

    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await this.prisma.order.count({
      where: {
        supplierId,
        slotLabel,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: OrderStatus.CANCELLED,
        },
      },
    });

    if (count >= config.maxOrdersPerDay) {
      throw new BadRequestException(
        'Selected slot is full. Please choose another time.',
      );
    }

    return { scheduledDate, slotLabel };
  }
}
