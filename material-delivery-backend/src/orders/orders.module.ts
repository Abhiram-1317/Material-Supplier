import {Module} from '@nestjs/common';
import {OrdersService} from './orders.service';
import {OrdersController} from './orders.controller';
import {RolesGuard} from '../auth/roles.guard';
import {NotificationsModule} from '../notifications/notifications.module';
import {PrismaModule} from '../prisma/prisma.module';
import {SlotCapacityService} from '../slots/slot-capacity.service';

@Module({
  imports: [NotificationsModule, PrismaModule],
  providers: [OrdersService, RolesGuard, SlotCapacityService],
  controllers: [OrdersController],
})
export class OrdersModule {}
