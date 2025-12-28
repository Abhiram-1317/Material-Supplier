import {Module} from '@nestjs/common';
import {OrderTrackingService} from './order-tracking.service';
import {OrderTrackingController} from './order-tracking.controller';
import {PrismaModule} from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrderTrackingController],
  providers: [OrderTrackingService],
})
export class OrderTrackingModule {}
