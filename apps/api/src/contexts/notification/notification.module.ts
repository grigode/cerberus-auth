import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import {
  AppConfigService,
  ConfigModule,
  RedisConfigService,
} from '@core/config';
import { DatabaseModule } from '@core/database';
import {
  EMAIL_SENDER_DRIVEN_PORT_TOKEN,
  type EmailSenderDrivenPort,
  IN_APP_NOTIFICATION_BROADCASTER_DRIVEN_PORT_TOKEN,
  type InAppNotificationBroadcasterDrivenPort,
  IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN,
  type InAppNotificationRepositoryDrivenPort,
  NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN,
  TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN,
  type TemplateRendererDrivenPort,
} from '@core/domain';

import {
  CreateInAppNotificationUseCase,
  GetNotificationHistoryUseCase,
  MarkAllNotificationsAsReadUseCase,
  MarkNotificationAsReadUseCase,
  SendPasswordResetEmailUseCase,
  SendVerificationEmailUseCase,
  StreamInAppNotificationsUseCase,
  useCases,
} from './application';
import {
  BullMQNotificationProcessor,
  BullMQNotificationProducer,
  HandlebarsTemplateRendererAdapter,
  NodemailerAdapter,
  notificationControllers,
  NOTIFICATIONS_QUEUE_NAME,
  RxJsInAppNotificationBroadcasterAdapter,
  TypeOrmInAppNotificationAdapter,
} from './infrastructure';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
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
  controllers: [...notificationControllers],
  providers: [
    {
      provide: TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN,
      useClass: HandlebarsTemplateRendererAdapter,
    },
    {
      provide: EMAIL_SENDER_DRIVEN_PORT_TOKEN,
      useClass: NodemailerAdapter,
    },
    {
      provide: NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN,
      useClass: BullMQNotificationProducer,
    },
    {
      provide: IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN,
      useClass: TypeOrmInAppNotificationAdapter,
    },
    {
      provide: IN_APP_NOTIFICATION_BROADCASTER_DRIVEN_PORT_TOKEN,
      useClass: RxJsInAppNotificationBroadcasterAdapter,
    },
    BullMQNotificationProcessor,
    {
      provide: SendVerificationEmailUseCase,
      useFactory: (
        templateRenderer: TemplateRendererDrivenPort,
        emailSender: EmailSenderDrivenPort,
        appConfig: AppConfigService,
      ) =>
        new SendVerificationEmailUseCase(
          templateRenderer,
          emailSender,
          appConfig,
        ),
      inject: [
        TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN,
        EMAIL_SENDER_DRIVEN_PORT_TOKEN,
        AppConfigService,
      ],
    },
    {
      provide: SendPasswordResetEmailUseCase,
      useFactory: (
        templateRenderer: TemplateRendererDrivenPort,
        emailSender: EmailSenderDrivenPort,
        appConfig: AppConfigService,
      ) =>
        new SendPasswordResetEmailUseCase(
          templateRenderer,
          emailSender,
          appConfig,
        ),
      inject: [
        TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN,
        EMAIL_SENDER_DRIVEN_PORT_TOKEN,
        AppConfigService,
      ],
    },
    {
      provide: CreateInAppNotificationUseCase,
      useFactory: (
        repository: InAppNotificationRepositoryDrivenPort,
        broadcaster: InAppNotificationBroadcasterDrivenPort,
      ) => new CreateInAppNotificationUseCase(repository, broadcaster),
      inject: [
        IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN,
        IN_APP_NOTIFICATION_BROADCASTER_DRIVEN_PORT_TOKEN,
      ],
    },
    {
      provide: GetNotificationHistoryUseCase,
      useFactory: (repository: InAppNotificationRepositoryDrivenPort) =>
        new GetNotificationHistoryUseCase(repository),
      inject: [IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN],
    },
    {
      provide: MarkNotificationAsReadUseCase,
      useFactory: (repository: InAppNotificationRepositoryDrivenPort) =>
        new MarkNotificationAsReadUseCase(repository),
      inject: [IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN],
    },
    {
      provide: MarkAllNotificationsAsReadUseCase,
      useFactory: (repository: InAppNotificationRepositoryDrivenPort) =>
        new MarkAllNotificationsAsReadUseCase(repository),
      inject: [IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN],
    },
    {
      provide: StreamInAppNotificationsUseCase,
      useFactory: (broadcaster: InAppNotificationBroadcasterDrivenPort) =>
        new StreamInAppNotificationsUseCase(broadcaster),
      inject: [IN_APP_NOTIFICATION_BROADCASTER_DRIVEN_PORT_TOKEN],
    },
  ],
  exports: [
    NOTIFICATION_QUEUE_DRIVER_PORT_TOKEN,
    EMAIL_SENDER_DRIVEN_PORT_TOKEN,
    TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN,
    IN_APP_NOTIFICATION_REPOSITORY_DRIVEN_PORT_TOKEN,
    IN_APP_NOTIFICATION_BROADCASTER_DRIVEN_PORT_TOKEN,
    ...useCases,
  ],
})
export class NotificationModule {}
