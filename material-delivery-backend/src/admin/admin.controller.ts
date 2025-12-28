import {Body, Controller, Get, Param, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AdminService} from './admin.service';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {UserRole} from '@prisma/client';
import {QuerySuppliersDto} from './dto/query-suppliers.dto';
import {UpdateSupplierStatusDto} from './dto/update-supplier-status.dto';
import {QueryOrdersDto} from './dto/query-orders.dto';
import {QueryRatingsDto} from './dto/query-ratings.dto';
import {CreateSupplierDto} from './dto/create-supplier.dto';
import {CreateCouponDto} from './dto/create-coupon.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('suppliers')
  listSuppliers(@Query() query: QuerySuppliersDto) {
    return this.adminService.listSuppliers(query);
  }

  @Post('suppliers')
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.adminService.createSupplier(dto);
  }

  @Patch('suppliers/:id/status')
  updateSupplierStatus(@Param('id') id: string, @Body() dto: UpdateSupplierStatusDto) {
    return this.adminService.updateSupplierStatus(id, dto);
  }

  @Get('orders')
  listOrders(@Query() query: QueryOrdersDto) {
    return this.adminService.listOrders(query);
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  @Get('ratings')
  listRatings(@Query() query: QueryRatingsDto) {
    return this.adminService.listRatings(query);
  }

  @Post('coupons')
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.adminService.createCoupon(dto);
  }

  @Get('coupons')
  listCoupons() {
    return this.adminService.listCoupons();
  }
}
