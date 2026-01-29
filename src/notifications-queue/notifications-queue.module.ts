import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsProcessor } from './notifications.processor'; 
import { NotificationClientModule } from 'src/common/notification-client/notification-client.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
      NotificationClientModule,
  ],
  providers: [NotificationsProcessor],
  exports: [BullModule],
})
export class NotificationsQueueModule {}