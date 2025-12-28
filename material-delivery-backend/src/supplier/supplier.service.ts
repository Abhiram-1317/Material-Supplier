import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DriverStatus,
  OrderStatus,
  Prisma,
  SupplierSlotConfig,
  Unit,
  VehicleStatus,
  VehicleType,
} from '@prisma/client';
import {PrismaService} from '../prisma/prisma.service';
import {CreateSupplierProductDto, UpdateSupplierProductDto} from './dto/product.dto';
import {UpdateOrderStatusDto} from './dto/update-order-status.dto';
import {CreateVehicleDto, UpdateVehicleDto} from './dto/vehicle.dto';
import {CreateDriverDto, UpdateDriverDto} from './dto/driver.dto';
import {NotificationsService} from '../notifications/notifications.service';
import {OrderSlaService} from '../sla/order-sla.service';
import {UpsertSlotConfigsDto} from './dto/slot-config.dto';

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly orderSla: OrderSlaService,
  ) {}

  private async getSupplierByUserId(userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: {userId},
      include: {city: true},
    });
    if (!supplier) {
      throw new ForbiddenException('No supplier profile associated with this user');
    }
    return supplier;
  }

  async getProfile(userId: string) {
    return this.getSupplierByUserId(userId);
  }

  // PRODUCTS
  async listProducts(userId: string) {
    const supplier = await this.getSupplierByUserId(userId);
    return this.prisma.product.findMany({
      where: {supplierId: supplier.id},
      include: {
        category: true,
        city: true,
      },
      orderBy: {createdAt: 'desc'},
    });
  }

  async createProduct(userId: string, dto: CreateSupplierProductDto) {
    const supplier = await this.getSupplierByUserId(userId);

    const category = await this.prisma.productCategory.findUnique({
      where: {slug: dto.categorySlug},
    });
    if (!category) {
      throw new BadRequestException(`Unknown category slug: ${dto.categorySlug}`);
    }

    const data: Prisma.ProductCreateInput = {
      name: dto.name,
      unit: dto.unit as Unit,
      basePrice: new Prisma.Decimal(dto.basePrice),
      minOrderQty: dto.minOrderQty,
      leadTimeHours: dto.leadTimeHours,
      imageUrl: dto.imageUrl,
      attributes: dto.attributes,
      bulkTiers: dto.bulkTiers,
      deliveryCharge: dto.deliveryCharge ?? 0,
      isActive: true,
      supplier: {connect: {id: supplier.id}},
      category: {connect: {id: category.id}},
      city: {connect: {id: supplier.cityId}},
    };

    return this.prisma.product.create({data});
  }

  async updateProduct(userId: string, productId: string, dto: UpdateSupplierProductDto) {
    const supplier = await this.getSupplierByUserId(userId);

    const existing = await this.prisma.product.findUnique({
      where: {id: productId},
    });
    if (!existing || existing.supplierId !== supplier.id) {
      throw new NotFoundException('Product not found');
    }

    const data: Prisma.ProductUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.unit !== undefined) data.unit = dto.unit;
    if (dto.basePrice !== undefined) data.basePrice = new Prisma.Decimal(dto.basePrice);
    if (dto.minOrderQty !== undefined) data.minOrderQty = dto.minOrderQty;
    if (dto.leadTimeHours !== undefined) data.leadTimeHours = dto.leadTimeHours;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.attributes !== undefined) data.attributes = dto.attributes as any;
    if (dto.bulkTiers !== undefined) data.bulkTiers = dto.bulkTiers as any;
    if (dto.deliveryCharge !== undefined) data.deliveryCharge = dto.deliveryCharge;

    if (dto.categorySlug) {
      const category = await this.prisma.productCategory.findUnique({
        where: {slug: dto.categorySlug},
      });
      if (!category) {
        throw new BadRequestException(`Unknown category slug: ${dto.categorySlug}`);
      }
      data.category = {connect: {id: category.id}};
    }

    return this.prisma.product.update({
      where: {id: productId},
      data,
    });
  }

  // ORDERS
  async listOrders(userId: string) {
    const supplier = await this.getSupplierByUserId(userId);
    return this.prisma.order.findMany({
      where: {supplierId: supplier.id},
      include: {
        site: {include: {city: true}},
        customer: true,
        items: {include: {product: true}},
      },
      orderBy: {createdAt: 'desc'},
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const supplier = await this.getSupplierByUserId(userId);
    const order = await this.prisma.order.findUnique({
      where: {id: orderId},
      include: {
        site: {include: {city: true}},
        customer: true,
        items: {include: {product: true}},
      },
    });
    if (!order || order.supplierId !== supplier.id) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateOrderStatus(userId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const supplier = await this.getSupplierByUserId(userId);
    const order = await this.prisma.order.findUnique({
      where: {id: orderId},
    });
    if (!order || order.supplierId !== supplier.id) {
      throw new NotFoundException('Order not found');
    }

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PLACED: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
      ACCEPTED: [OrderStatus.DISPATCHED, OrderStatus.CANCELLED],
      DISPATCHED: [OrderStatus.DELIVERED],
      DELIVERED: [],
      CANCELLED: [],
    };

    const possible = allowedTransitions[order.status] ?? [];
    if (!possible.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot change status from ${order.status} to ${dto.status}`,
      );
    }

    const now = new Date();
    const statusData: Prisma.OrderUpdateInput = {status: dto.status};

    if (dto.status === OrderStatus.ACCEPTED && !order.acceptedAt) {
      statusData.acceptedAt = now;
    }
    if (dto.status === OrderStatus.DISPATCHED && !order.dispatchedAt) {
      statusData.dispatchedAt = now;
    }
    if (dto.status === OrderStatus.CANCELLED && !order.cancelledAt) {
      statusData.cancelledAt = now;
    }
    if (dto.status === OrderStatus.DELIVERED && !order.deliveredAt) {
      statusData.deliveredAt = now;
      statusData.slaStatus = this.orderSla.computeSlaStatus(order as any, now);
    }

    const updated = await this.prisma.order.update({
      where: {id: orderId},
      data: statusData,
      include: {
        customer: {include: {user: true}},
      },
    });

    void this.notifications
      .notifyOrderStatusChanged(updated as any, dto.status)
      .catch((err) =>
        this.logger.warn(`Failed to create status notifications: ${String(err)}`),
      );

    return updated;
  }

  // VEHICLES
  async listVehicles(userId: string) {
    const supplier = await this.getSupplierByUserId(userId);
    return this.prisma.vehicle.findMany({
      where: {supplierId: supplier.id},
      include: {city: true, assignedDriver: true},
      orderBy: {createdAt: 'desc'},
    });
  }

  async createVehicle(userId: string, dto: CreateVehicleDto) {
    const supplier = await this.getSupplierByUserId(userId);
    const data: Prisma.VehicleCreateInput = {
      registrationNumber: dto.registrationNumber,
      type: dto.type as VehicleType,
      capacityTons: dto.capacityTons,
      status: dto.status ?? VehicleStatus.ACTIVE,
      notes: dto.notes,
      supplier: {connect: {id: supplier.id}},
      city: {connect: {id: dto.cityId}},
    };
    return this.prisma.vehicle.create({data, include: {city: true, assignedDriver: true}});
  }

  async updateVehicle(userId: string, id: string, dto: UpdateVehicleDto) {
    const supplier = await this.getSupplierByUserId(userId);
    const existing = await this.prisma.vehicle.findUnique({where: {id}});
    if (!existing || existing.supplierId !== supplier.id) {
      throw new NotFoundException('Vehicle not found');
    }

    const data: Prisma.VehicleUpdateInput = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.capacityTons !== undefined) data.capacityTons = dto.capacityTons;
    if (dto.cityId !== undefined) data.city = {connect: {id: dto.cityId}};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.assignedDriverId !== undefined) {
      if (dto.assignedDriverId === null) {
        data.assignedDriver = {disconnect: true};
      } else {
        data.assignedDriver = {connect: {id: dto.assignedDriverId}};
      }
    }

    return this.prisma.vehicle.update({
      where: {id},
      data,
      include: {city: true, assignedDriver: true},
    });
  }

  // DRIVERS
  async listDrivers(userId: string) {
    const supplier = await this.getSupplierByUserId(userId);
    return this.prisma.driver.findMany({
      where: {supplierId: supplier.id},
      include: {city: true, assignedVehicle: true},
      orderBy: {createdAt: 'desc'},
    });
  }

  async createDriver(userId: string, dto: CreateDriverDto) {
    const supplier = await this.getSupplierByUserId(userId);
    const data: Prisma.DriverCreateInput = {
      name: dto.name,
      phone: dto.phone,
      licenseNumber: dto.licenseNumber,
      status: dto.status ?? DriverStatus.ACTIVE,
      supplier: {connect: {id: supplier.id}},
      city: {connect: {id: dto.cityId}},
    };
    if (dto.assignedVehicleId) {
      data.assignedVehicle = {connect: {id: dto.assignedVehicleId}};
    }
    return this.prisma.driver.create({
      data,
      include: {city: true, assignedVehicle: true},
    });
  }

  async updateDriver(userId: string, id: string, dto: UpdateDriverDto) {
    const supplier = await this.getSupplierByUserId(userId);
    const existing = await this.prisma.driver.findUnique({where: {id}});
    if (!existing || existing.supplierId !== supplier.id) {
      throw new NotFoundException('Driver not found');
    }

    const data: Prisma.DriverUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.cityId !== undefined) data.city = {connect: {id: dto.cityId}};
    if (dto.licenseNumber !== undefined) data.licenseNumber = dto.licenseNumber;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.assignedVehicleId !== undefined) {
      if (dto.assignedVehicleId === null) {
        data.assignedVehicle = {disconnect: true};
      } else {
        data.assignedVehicle = {connect: {id: dto.assignedVehicleId}};
      }
    }

    return this.prisma.driver.update({
      where: {id},
      data,
      include: {city: true, assignedVehicle: true},
    });
  }

  async getSlotConfigsForSupplier(userId: string): Promise<SupplierSlotConfig[]> {
    const supplier = await this.getSupplierByUserId(userId);

    const existing = await this.prisma.supplierSlotConfig.findMany({
      where: {supplierId: supplier.id},
      orderBy: {label: 'asc'},
    });

    if (existing.length > 0) {
      return existing;
    }

    const defaults: {label: string; maxOrdersPerDay: number}[] = [
      {label: '8–11 AM', maxOrdersPerDay: 5},
      {label: '11–2 PM', maxOrdersPerDay: 4},
      {label: '2–5 PM', maxOrdersPerDay: 3},
    ];

    const created: SupplierSlotConfig[] = [];
    for (const d of defaults) {
      const cfg = await this.prisma.supplierSlotConfig.create({
        data: {
          supplierId: supplier.id,
          label: d.label,
          maxOrdersPerDay: d.maxOrdersPerDay,
          isActive: true,
        },
      });
      created.push(cfg);
    }
    return created;
  }

  async upsertSlotConfigsForSupplier(
    userId: string,
    dto: UpsertSlotConfigsDto,
  ): Promise<SupplierSlotConfig[]> {
    const supplier = await this.getSupplierByUserId(userId);

    for (const slot of dto.slots) {
      await this.prisma.supplierSlotConfig.upsert({
        where: {
          supplierId_label: {
            supplierId: supplier.id,
            label: slot.label,
          },
        },
        update: {
          maxOrdersPerDay: slot.maxOrdersPerDay,
          isActive: slot.isActive,
        },
        create: {
          supplierId: supplier.id,
          label: slot.label,
          maxOrdersPerDay: slot.maxOrdersPerDay,
          isActive: slot.isActive,
        },
      });
    }

    return this.prisma.supplierSlotConfig.findMany({
      where: {supplierId: supplier.id},
      orderBy: {label: 'asc'},
    });
  }
}
