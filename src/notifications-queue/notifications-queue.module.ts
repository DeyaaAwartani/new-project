import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationClientModule } from 'src/common/notification-client/notification-client.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    NotificationClientModule,

    // ✅ اربط الـ queue بالـ dashboard
    BullBoardModule.forFeature({
      name: 'notifications',
      adapter: BullMQAdapter,
    }),
  ],
  providers: [NotificationsProcessor],
  exports: [BullModule],
})
export class NotificationsQueueModule {}
