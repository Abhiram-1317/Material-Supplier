import {Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {OrderTrackingService} from './order-tracking.service';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {UserRole} from '@prisma/client';
import {CreateTrackingPointDto} from './dto/create-tracking.dto';

@ApiTags('order-tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders/:orderId/track')
export class OrderTrackingController {
  constructor(private readonly trackingService: OrderTrackingService) {}

  private getUserId(req: any): string {
    return req?.user?.sub;
  }

  @Post()
  @Roles(UserRole.SUPPLIER)
  async addTrackingPoint(@Req() req: any, @Param('orderId') orderId: string, @Body() dto: CreateTrackingPointDto) {
    const userId = this.getUserId(req);
    return this.trackingService.addTrackingPointForSupplier(userId, orderId, dto);
  }

  @Get('latest')
  async getLatest(@Req() req: any, @Param('orderId') orderId: string) {
    const userId = this.getUserId(req);
    return this.trackingService.getLatestTrackingPoint(userId, orderId);
  }
}
