import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {
  DiscountType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  SupplierSlotConfig,
  UserRole,
} from '@prisma/client';
import {PrismaService} from '../prisma/prisma.service';
import {CreateOrderDto} from './dto/create-order.dto';
import {NotificationsService} from '../notifications/notifications.service';
import {SlotCapacityService} from '../slots/slot-capacity.service';

const DEMO_SITE = {
  id: 'site-1',
  label: 'Main Project Site',
  addressLine: '123 Demo Street, Mumbai',
  city: {id: 1, name: 'Mumbai', code: 'MUM'},
};

const DEMO_SUPPLIER = {id: 'sup-1', companyName: 'Metro Materials'};

const DEMO_ORDER_ITEMS = [
  {
    id: 'item-1',
    quantity: 100,
    unitPrice: 380,
    totalPrice: 38000,
    product: {id: 'prod-1', name: 'UltraTech OPC 53', unit: 'BAG'},
  },
];

const DEMO_ORDERS = [
  {
    id: 'order-1',
    orderCode: 'CMT-0001',
    status: OrderStatus.PLACED,
    scheduledSlot: 'Tomorrow 10:00-12:00',
    totalAmount: 38000,
    deliveryFee: 500,
    taxAmount: 6840,
    discountAmount: 0,
    couponCode: null,
    createdAt: new Date().toISOString(),
    paymentMethod: PaymentMethod.COD,
    paymentStatus: PaymentStatus.PENDING,
    site: DEMO_SITE,
    supplier: DEMO_SUPPLIER,
    items: DEMO_ORDER_ITEMS,
  },
];

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly slotCapacity: SlotCapacityService,
  ) {}

  async listCustomerOrders(customerId: string) {
    return DEMO_ORDERS;
  }

  async getCustomerOrderById(customerId: string, orderId: string) {
    const order = DEMO_ORDERS.find((o) => o.id === orderId);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async createOrder(customerId: string, dto: CreateOrderDto) {
    const subtotal = dto.items.reduce((sum, item) => sum + item.quantity * 100, 0);
    const deliveryFee = 250;
    const taxAmount = Number((subtotal * 0.18).toFixed(2));
    const baseTotal = subtotal + deliveryFee + taxAmount;

    const {scheduledDate, slotLabel} = await this.slotCapacity.ensureCapacityOrThrow(
      dto.supplierId,
      dto.scheduledSlot ?? 'Tomorrow 10:00-12:00',
    );

    const couponResult = dto.couponCode
      ? await this.applyCoupon(dto.couponCode, baseTotal)
      : {discountAmount: 0, couponCode: undefined};

    const totalAmount = Math.max(0, baseTotal - couponResult.discountAmount);

    const newOrder = {
      id: `order-${Date.now()}`,
      orderCode: `CMT-${Date.now()}`,
      status: OrderStatus.PLACED,
      scheduledSlot: dto.scheduledSlot ?? 'Tomorrow 10:00-12:00',
      scheduledDate: scheduledDate.toISOString(),
      slotLabel,
      totalAmount,
      deliveryFee,
      taxAmount,
      discountAmount: couponResult.discountAmount,
      couponCode: couponResult.couponCode ?? null,
      createdAt: new Date().toISOString(),
      paymentMethod: PaymentMethod.COD,
      paymentStatus: PaymentStatus.PENDING,
      site: DEMO_SITE,
      supplier: DEMO_SUPPLIER,
      items: dto.items.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        quantity: item.quantity,
        unitPrice: 100,
        totalPrice: item.quantity * 100,
        product: {id: item.productId, name: 'Demo Product', unit: 'BAG'},
      })),
    };

    DEMO_ORDERS.unshift(newOrder as any);

    // Best-effort in-app notification for demo data
    void this.notifications
      .notifyOrderPlaced({
        ...(newOrder as any),
        customer: {user: {id: 'demo-customer', role: UserRole.CUSTOMER, phone: '+911234567890'}},
        supplier: {user: null},
      })
      .catch((err) => this.logger.warn(`Failed to create notifications: ${String(err)}`));

    return newOrder;
  }

  private async applyCoupon(code: string, orderAmount: number) {
    const trimmed = code.trim();
    if (!trimmed) {
      throw new BadRequestException('Coupon code is empty');
    }

    const normalizedCode = trimmed.toUpperCase();
    const coupon = await this.prisma.coupon.findUnique({where: {code: normalizedCode}});
    if (!coupon) throw new BadRequestException('Invalid coupon code');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');

    const now = new Date();
    if (coupon.expiryDate < now) throw new BadRequestException('Coupon expired');
    if (orderAmount < coupon.minOrderValue) {
      throw new BadRequestException(`Minimum order value for this coupon is ${coupon.minOrderValue}`);
    }

    let discountAmount = 0;
    if (coupon.discountType === DiscountType.FLAT) {
      discountAmount = coupon.value;
    } else if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    }

    if (discountAmount <= 0) {
      throw new BadRequestException('Coupon does not provide any discount');
    }

    return {discountAmount, couponCode: coupon.code};
  }

  async getSlotAvailability(supplierId: string, dateIso: string) {
    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const configs: SupplierSlotConfig[] = await this.prisma.supplierSlotConfig.findMany({
      where: {supplierId, isActive: true},
      orderBy: {label: 'asc'},
    });

    if (configs.length === 0) {
      return [];
    }

    const orders = await this.prisma.order.groupBy({
      by: ['slotLabel'],
      where: {
        supplierId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: OrderStatus.CANCELLED,
        },
      },
      _count: {_all: true},
    });

    const countsByLabel = new Map<string, number>();
    for (const o of orders) {
      if (!o.slotLabel) continue;
      countsByLabel.set(o.slotLabel, o._count._all);
    }

    return configs.map((cfg) => {
      const booked = countsByLabel.get(cfg.label) ?? 0;
      const available = Math.max(0, cfg.maxOrdersPerDay - booked);
      return {
        label: cfg.label,
        maxOrdersPerDay: cfg.maxOrdersPerDay,
        booked,
        available,
        isActive: cfg.isActive,
      };
    });
  }
}
