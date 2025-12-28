import {Body, Controller, Get, Param, Post, Query, Request, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {Roles} from '../auth/roles.decorator';
import {RolesGuard} from '../auth/roles.guard';
import {CreateOrderDto} from './dto/create-order.dto';
import {OrdersService} from './orders.service';
import {Throttle} from '@nestjs/throttler';
import {SlotAvailabilityQueryDto} from './dto/slot-availability-query.dto';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Request() req: any) {
    return this.ordersService.listCustomerOrders(req.user.sub);
  }

  @Get(':id')
  getById(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.getCustomerOrderById(req.user.sub, id);
  }

  @Post()
  @Throttle({default: {limit: 30, ttl: 60_000}})
  create(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('slot-availability')
  getSlotAvailability(@Query() query: SlotAvailabilityQueryDto) {
    return this.ordersService.getSlotAvailability(query.supplierId, query.date);
  }
}
