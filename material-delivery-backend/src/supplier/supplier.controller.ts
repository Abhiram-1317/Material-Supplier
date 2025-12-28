import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import type {Request} from 'express';
import {UserRole} from '@prisma/client';
import {SupplierService} from './supplier.service';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {CreateSupplierProductDto, UpdateSupplierProductDto} from './dto/product.dto';
import {UpdateOrderStatusDto} from './dto/update-order-status.dto';
import {CreateVehicleDto, UpdateVehicleDto} from './dto/vehicle.dto';
import {CreateDriverDto, UpdateDriverDto} from './dto/driver.dto';
import {RatingsService} from '../ratings/ratings.service';
import {UpsertSlotConfigsDto} from './dto/slot-config.dto';

type AuthenticatedRequest = Request & {user?: {sub?: string}};

@ApiTags('supplier')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPPLIER)
@Controller('supplier')
export class SupplierController {
  constructor(
    private readonly supplierService: SupplierService,
    private readonly ratingsService: RatingsService,
  ) {}

  private getUserId(req: AuthenticatedRequest): string {
    const user = req.user as {sub?: string};
    return user?.sub as string;
  }

  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.supplierService.getProfile(this.getUserId(req));
  }

  @Get('products')
  listProducts(@Req() req: AuthenticatedRequest) {
    return this.supplierService.listProducts(this.getUserId(req));
  }

  @Post('products')
  createProduct(@Req() req: AuthenticatedRequest, @Body() dto: CreateSupplierProductDto) {
    return this.supplierService.createProduct(this.getUserId(req), dto);
  }

  @Patch('products/:id')
  updateProduct(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierProductDto,
  ) {
    return this.supplierService.updateProduct(this.getUserId(req), id, dto);
  }

  @Get('orders')
  listOrders(@Req() req: AuthenticatedRequest) {
    return this.supplierService.listOrders(this.getUserId(req));
  }

  @Get('ratings')
  listMyRatings(@Req() req: AuthenticatedRequest) {
    return this.ratingsService.listRatingsForSupplier(this.getUserId(req));
  }

  @Get('orders/:id')
  getOrder(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.supplierService.getOrderById(this.getUserId(req), id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.supplierService.updateOrderStatus(this.getUserId(req), id, dto);
  }

  // VEHICLES
  @Get('vehicles')
  listVehicles(@Req() req: AuthenticatedRequest) {
    return this.supplierService.listVehicles(this.getUserId(req));
  }

  @Post('vehicles')
  createVehicle(@Req() req: AuthenticatedRequest, @Body() dto: CreateVehicleDto) {
    return this.supplierService.createVehicle(this.getUserId(req), dto);
  }

  @Patch('vehicles/:id')
  updateVehicle(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.supplierService.updateVehicle(this.getUserId(req), id, dto);
  }

  // DRIVERS
  @Get('drivers')
  listDrivers(@Req() req: AuthenticatedRequest) {
    return this.supplierService.listDrivers(this.getUserId(req));
  }

  @Post('drivers')
  createDriver(@Req() req: AuthenticatedRequest, @Body() dto: CreateDriverDto) {
    return this.supplierService.createDriver(this.getUserId(req), dto);
  }

  @Patch('drivers/:id')
  updateDriver(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.supplierService.updateDriver(this.getUserId(req), id, dto);
  }

  @Get('slots')
  getSlots(@Req() req: AuthenticatedRequest) {
    return this.supplierService.getSlotConfigsForSupplier(this.getUserId(req));
  }

  @Put('slots')
  upsertSlots(@Req() req: AuthenticatedRequest, @Body() dto: UpsertSlotConfigsDto) {
    return this.supplierService.upsertSlotConfigsForSupplier(this.getUserId(req), dto);
  }
}
