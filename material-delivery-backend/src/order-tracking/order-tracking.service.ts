import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {UserRole} from '@prisma/client';

@Injectable()
export class OrderTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyOrderAccess(userId: string, orderId: string, roles: UserRole[]) {
    const user = await this.prisma.user.findUnique({
      where: {id: userId},
      include: {
        customer: true,
        supplier: true,
      },
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    const order = await this.prisma.order.findUnique({
      where: {id: orderId},
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user.role === UserRole.CUSTOMER && order.customerId !== user.customer?.id) {
      throw new ForbiddenException('You do not own this order');
    }
    if (user.role === UserRole.SUPPLIER && order.supplierId !== user.supplier?.id) {
      throw new ForbiddenException('You do not own this order');
    }

    return order;
  }

  async addTrackingPointForSupplier(userId: string, orderId: string, dto: {latitude: number; longitude: number}) {
    await this.verifyOrderAccess(userId, orderId, [UserRole.SUPPLIER]);

    if (dto.latitude < -90 || dto.latitude > 90 || dto.longitude < -180 || dto.longitude > 180) {
      throw new BadRequestException('Invalid coordinates');
    }

    return this.prisma.orderTrackingPoint.create({
      data: {
        orderId,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  async getLatestTrackingPoint(userId: string, orderId: string) {
    await this.verifyOrderAccess(userId, orderId, [UserRole.CUSTOMER, UserRole.SUPPLIER, UserRole.ADMIN]);

    const point = await this.prisma.orderTrackingPoint.findFirst({
      where: {orderId},
      orderBy: {createdAt: 'desc'},
    });

    return point;
  }
}
