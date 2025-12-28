import {Module, Provider, forwardRef} from '@nestjs/common';
import {BullModule, getQueueToken} from '@nestjs/bullmq';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {NotificationProcessor} from './notification.processor';
import {PrismaModule} from '../prisma/prisma.module';
import {NotificationsModule} from '../notifications/notifications.module';

const queueEnabled = process.env.QUEUE_ENABLED === 'true';

const queueImports = queueEnabled
  ? [
      BullModule.registerQueueAsync({
        name: 'notifications',
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => {
          const host = config.get<string>('queue.redisHost');
          const port = config.get<number>('queue.redisPort');
          return {
            connection: {
              host,
              port,
            },
          };
        },
      }),
    ]
  : [];

const queueProviders: Provider[] = queueEnabled
  ? [NotificationProcessor]
  : [
      {
        // Stub queue so injections succeed when queue is disabled
        provide: getQueueToken('notifications'),
        useValue: null,
      },
    ];

const queueExports: (typeof BullModule | string)[] = queueEnabled
  ? [BullModule]
  : [getQueueToken('notifications')];

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    forwardRef(() => NotificationsModule),
    ...queueImports,
  ],
  providers: queueProviders,
  exports: queueExports,
})
export class NotificationQueueModule {}
