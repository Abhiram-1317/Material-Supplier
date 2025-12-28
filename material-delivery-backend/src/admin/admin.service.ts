import {ConflictException, Injectable} from '@nestjs/common';
import {Prisma, SupplierStatus, UserRole} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {PrismaService} from '../prisma/prisma.service';
import {QuerySuppliersDto} from './dto/query-suppliers.dto';
import {UpdateSupplierStatusDto} from './dto/update-supplier-status.dto';
import {QueryOrdersDto} from './dto/query-orders.dto';
import {QueryRatingsDto} from './dto/query-ratings.dto';
import {CreateSupplierDto} from './dto/create-supplier.dto';
import {CreateCouponDto} from './dto/create-coupon.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [supplierCount, activeSuppliers, customerCount, orderCount, todayOrders] = await this.prisma.$transaction([
      this.prisma.supplier.count(),
      this.prisma.supplier.count({where: {status: SupplierStatus.ACTIVE}}),
      this.prisma.customer.count(),
      this.prisma.order.count(),
      this.prisma.order.count({where: {createdAt: {gte: startOfDay}}}),
    ]);

    const gmvTodayAgg = await this.prisma.order.aggregate({
      _sum: {totalAmount: true},
      where: {createdAt: {gte: startOfDay}},
    });

    return {
      supplierCount,
      activeSuppliers,
      customerCount,
      orderCount,
      todayOrders,
      gmvToday: gmvTodayAgg._sum.totalAmount ?? 0,
    };
  }

  async listSuppliers(query: QuerySuppliersDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.SupplierWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.cityCode) where.city = {code: query.cityCode};
    if (query.search) where.companyName = {contains: query.search, mode: 'insensitive'};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        include: {city: true, user: true},
        orderBy: {createdAt: 'desc'},
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.supplier.count({where}),
    ]);

    return {items, total, page, pageSize};
  }

  async createSupplier(dto: CreateSupplierDto) {
    const existing = await this.prisma.user.findUnique({where: {email: dto.email}});
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const supplier = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          role: UserRole.SUPPLIER,
        },
      });

      return tx.supplier.create({
        data: {
          companyName: dto.companyName,
          gstNumber: dto.gstNumber,
          cityId: dto.cityId,
          address: dto.address,
          status: SupplierStatus.ACTIVE,
          userId: user.id,
        },
        include: {user: true, city: true},
      });
    });

    return supplier;
  }

  async updateSupplierStatus(id: string, dto: UpdateSupplierStatusDto) {
    return this.prisma.supplier.update({where: {id}, data: {status: dto.status}});
  }

  async createCoupon(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.coupon.findUnique({where: {code}});
    if (existing) throw new ConflictException('Coupon code already exists');

    const expiryDate = new Date(dto.expiryDate);
    if (Number.isNaN(expiryDate.getTime())) {
      throw new ConflictException('Invalid expiry date');
    }

    return this.prisma.coupon.create({
      data: {
        code,
        discountType: dto.discountType,
        value: dto.value,
        minOrderValue: dto.minOrderValue,
        maxDiscountAmount: dto.maxDiscountAmount ?? null,
        isActive: dto.isActive ?? true,
        expiryDate,
      },
    });
  }

  async listCoupons() {
    return this.prisma.coupon.findMany({orderBy: {createdAt: 'desc'}});
  }

  async listOrders(query: QueryOrdersDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const filters: Prisma.OrderWhereInput[] = [];

    if (query.status) filters.push({status: query.status});
    if (query.supplierId) filters.push({supplierId: query.supplierId});
    if (query.cityCode) filters.push({city: {code: query.cityCode}});
    if (query.search) {
      filters.push({
        OR: [
          {orderCode: {contains: query.search, mode: 'insensitive'}},
          {customer: {user: {fullName: {contains: query.search, mode: 'insensitive'}}}},
          {customer: {companyName: {contains: query.search, mode: 'insensitive'}}},
        ],
      });
    }

    const where: Prisma.OrderWhereInput = filters.length ? {AND: filters} : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          site: {include: {city: true}},
          supplier: true,
          customer: {include: {user: true}},
        },
        orderBy: {createdAt: 'desc'},
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({where}),
    ]);

    return {items, total, page, pageSize};
  }

  async listRatings(query: QueryRatingsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.OrderRatingWhereInput = {};

    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.rating) where.rating = query.rating;
    if (query.search) {
      where.OR = [
        {comment: {contains: query.search, mode: 'insensitive'}},
        {supplier: {companyName: {contains: query.search, mode: 'insensitive'}}},
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.orderRating.findMany({
        where,
        include: {
          supplier: true,
          customer: {include: {user: true}},
          order: true,
        },
        orderBy: {createdAt: 'desc'},
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.orderRating.count({where}),
    ]);

    return {items, total, page, pageSize};
  }

  async getOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: {id},
      include: {
        site: {include: {city: true}},
        supplier: true,
        customer: {include: {user: true}},
        items: {include: {product: true}},
      },
    });
  }
}
