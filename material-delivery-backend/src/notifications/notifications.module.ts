import {Module, forwardRef} from '@nestjs/common';
import {NotificationsService} from './notifications.service';
import {NotificationsController} from './notifications.controller';
import {PrismaService} from '../prisma/prisma.service';
import {NotificationQueueModule} from '../notification-queue/notification-queue.module';

@Module({
  imports: [forwardRef(() => NotificationQueueModule)],
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
