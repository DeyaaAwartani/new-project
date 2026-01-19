import { Module } from '@nestjs/common';
import { NotificationClientService } from './notification-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.NOTIFICATION_BASE_URL || 'http://localhost:3000',
      timeout: Number(process.env.NOTIFICATION_TIMEOUT_MS) || 5000,
    }),
  ],
  providers: [NotificationClientService],
  exports: [NotificationClientService],
})
export class NotificationClientModule {}
