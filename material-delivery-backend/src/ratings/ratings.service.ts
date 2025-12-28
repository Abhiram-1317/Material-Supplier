import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {OrderStatus, Prisma} from '@prisma/client';
import {PrismaService} from '../prisma/prisma.service';
import {CreateOrUpdateRatingDto} from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async rateOrderForCustomer(customerUserId: string, orderId: string, dto: CreateOrUpdateRatingDto) {
    const customer = await this.prisma.customer.findUnique({where: {userId: customerUserId}});
    if (!customer) {
      throw new ForbiddenException('No customer profile linked to this user');
    }

    const order = await this.prisma.order.findUnique({where: {id: orderId}, include: {supplier: true}});
    if (!order || order.customerId !== customer.id) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('You can only rate delivered orders');
    }

    const data: Prisma.OrderRatingCreateInput = {
      order: {connect: {id: order.id}},
      customer: {connect: {id: customer.id}},
      supplier: {connect: {id: order.supplierId}},
      rating: dto.rating,
      comment: dto.comment,
    };

    return this.prisma.orderRating.upsert({
      where: {orderId: order.id},
      create: data,
      update: {rating: dto.rating, comment: dto.comment},
    });
  }

  async getRatingForOrderCustomer(customerUserId: string, orderId: string) {
    const customer = await this.prisma.customer.findUnique({where: {userId: customerUserId}});
    if (!customer) {
      throw new ForbiddenException('No customer profile linked to this user');
    }

    const rating = await this.prisma.orderRating.findUnique({where: {orderId}});
    if (!rating || rating.customerId !== customer.id) {
      return null;
    }
    return rating;
  }

  async listRatingsForSupplier(supplierUserId: string) {
    const supplier = await this.prisma.supplier.findUnique({where: {userId: supplierUserId}});
    if (!supplier) {
      throw new ForbiddenException('No supplier profile linked to this user');
    }

    return this.prisma.orderRating.findMany({
      where: {supplierId: supplier.id},
      include: {
        order: true,
        customer: {include: {user: true}},
      },
      orderBy: {createdAt: 'desc'},
    });
  }
}
