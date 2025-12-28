import {Controller, Get, Patch, Param, UseGuards, Req} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {NotificationsService} from './notifications.service';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {PrismaService} from '../prisma/prisma.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private getUserId(req: any): string {
    return req?.user?.sub;
  }

  @Get()
  async listMyNotifications(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.prisma.notification.findMany({
      where: {userId},
      orderBy: {createdAt: 'desc'},
      take: 50,
    });
  }

  @Patch(':id/read')
  async markRead(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    const notif = await this.prisma.notification.findFirst({
      where: {id, userId},
    });
    if (!notif) {
      return;
    }
    return this.prisma.notification.update({
      where: {id},
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }
}
