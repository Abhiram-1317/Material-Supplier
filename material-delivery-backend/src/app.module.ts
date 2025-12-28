import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {CacheModule} from '@nestjs/cache-manager';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {redisStore} from 'cache-manager-ioredis-yet';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import configuration from './config/configuration';
import {validationSchema} from './config/validation';
import {PrismaModule} from './prisma/prisma.module';
import {AuthModule} from './auth/auth.module';
import {UsersModule} from './users/users.module';
import {CatalogModule} from './catalog/catalog.module';
import {CustomerModule} from './customer/customer.module';
import {OrdersModule} from './orders/orders.module';
import {SupplierModule} from './supplier/supplier.module';
import {AdminModule} from './admin/admin.module';
import {RatingsModule} from './ratings/ratings.module';
import {PaymentsModule} from './payments/payments.module';
import {NotificationsModule} from './notifications/notifications.module';
import {HealthModule} from './health/health.module';
import {NotificationQueueModule} from './notification-queue/notification-queue.module';
import {OrderTrackingModule} from './order-tracking/order-tracking.module';

@Module({
  imports: [
    // Run: npm install @nestjs/cache-manager cache-manager ioredis cache-manager-ioredis-yet
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisEnabled = config.get<boolean>('redis.enabled') ?? false;

        if (!redisEnabled) {
          return {
            ttl: 60,
          };
        }

        return {
          store: await redisStore({
            socket: {
              host: config.get<string>('redis.host'),
              port: config.get<number>('redis.port'),
            },
            ttl: 60,
          }),
        };
      },
    }),
    // Run: npm install @nestjs/throttler
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CatalogModule,
    CustomerModule,
    OrdersModule,
    SupplierModule,
    AdminModule,
    RatingsModule,
    PaymentsModule,
    NotificationsModule,
    HealthModule,
    NotificationQueueModule,
    OrderTrackingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
