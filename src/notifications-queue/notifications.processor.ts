import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { NotificationClientService } from 'src/common/notification-client/notification-client.service';
import { Order } from 'src/order/order.entity';
import { NotificationAttemptStatus } from 'src/order/enums/notification-attempt-status.enum';
import { NotificationStatus } from 'src/order/enums/notification-status.enum';
import { extractAxiosFailureReason } from 'src/common/utils/axios-error.util';
import { SendNotificationJob } from './types/send-notification.job';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  constructor(
    private readonly notificationClient: NotificationClientService,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<SendNotificationJob>): Promise<void> {
    // deal with job name 
    if (job.name !== 'send_notification') return;

    const { orderId, type, payload } = job.data;

    const orderRepo = this.dataSource.getRepository(Order);
    const order = await orderRepo.findOne({ where: { id: orderId } });

    // if order not exist 
    if (!order) return;

    try {
      if (type === 'EMAIL') {
        await this.notificationClient.sendEmail(payload);
      } else if (type === 'SMS') {
        await this.notificationClient.sendSms(payload);
      } else if (type === 'ALL') {
        await Promise.all([
          this.notificationClient.sendEmail(payload.email),
          this.notificationClient.sendSms(payload.sms),
        ]);
      }

      order.notificationStatus = NotificationStatus.SENT;
      order.notificationAttemptStatus = NotificationAttemptStatus.SUCCESS;
      order.notificationFailureReason = null;
      await orderRepo.save(order);
    } catch (err) {
      order.notificationStatus = NotificationStatus.NOT_SENT;
      order.notificationAttemptStatus = NotificationAttemptStatus.FAILED;
      order.notificationFailureReason = extractAxiosFailureReason(err);
      await orderRepo.save(order);

      // we must throw an error because BullMQ needs fails to mke retry
      throw err;
    }
  }
}
