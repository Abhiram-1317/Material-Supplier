import {Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {UserRole} from '@prisma/client';
import type {Request} from 'express';
import {RatingsService} from './ratings.service';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {CreateOrUpdateRatingDto} from './dto/create-rating.dto';

type AuthenticatedRequest = Request & {user?: {sub?: string}};

@ApiTags('ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  private getUserId(req: AuthenticatedRequest): string {
    const user = req.user as {sub?: string} | undefined;
    return user?.sub as string;
  }

  @Post('orders/:orderId')
  @Roles(UserRole.CUSTOMER)
  rateOrder(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
    @Body() dto: CreateOrUpdateRatingDto,
  ) {
    const userId = this.getUserId(req);
    return this.ratingsService.rateOrderForCustomer(userId, orderId, dto);
  }

  @Get('orders/:orderId')
  @Roles(UserRole.CUSTOMER)
  getMyOrderRating(@Req() req: AuthenticatedRequest, @Param('orderId') orderId: string) {
    const userId = this.getUserId(req);
    return this.ratingsService.getRatingForOrderCustomer(userId, orderId);
  }
}
