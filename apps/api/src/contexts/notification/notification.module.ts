import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, RedisConfigService } from '@core/config';
import { NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN } from '@core/domain';

import {
  BullMQNotificationProducer,
  NOTIFICATIONS_QUEUE_NAME,
} from './infrastructure/adapters/bullmq-notification.producer';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (redisConfig: RedisConfigService) => ({
        connection: {
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password || undefined,
        },
      }),
      inject: [RedisConfigService],
    }),
    BullModule.registerQueue({
      name: NOTIFICATIONS_QUEUE_NAME,
    }),
  ],
  providers: [
    {
      provide: NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN,
      useClass: BullMQNotificationProducer,
    },
    BullMQNotificationProducer,
  ],
  exports: [NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN, BullMQNotificationProducer],
})
export class NotificationModule {}
