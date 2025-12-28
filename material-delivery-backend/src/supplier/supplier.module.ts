import {Module} from '@nestjs/common';
import {SupplierController} from './supplier.controller';
import {SupplierService} from './supplier.service';
import {RatingsModule} from '../ratings/ratings.module';
import {NotificationsModule} from '../notifications/notifications.module';
import {PrismaModule} from '../prisma/prisma.module';
import {OrderSlaService} from '../sla/order-sla.service';

@Module({
  imports: [RatingsModule, NotificationsModule, PrismaModule],
  controllers: [SupplierController],
  providers: [SupplierService, OrderSlaService],
})
export class SupplierModule {}
