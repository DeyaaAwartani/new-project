import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Order } from '../order.entity';
import { NotificationStatus } from '../enums/notification-status.enum';
import { OrderStatus } from '../enums/order-status.enum';

import { User } from 'src/users/users.entity';
import { Product } from 'src/products/products.entity';
import { NotificationClientService } from 'src/common/notification-client/notification-client.service';

import { UsersSettings } from 'src/users-settings/entities/users-setting.entity';
import { NotificationPreference } from 'src/users-settings/enums/notification-preference.enum';

@Injectable()
export class OrderNotificationCron {
  private readonly logger = new Logger(OrderNotificationCron.name);

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly notificationClient: NotificationClientService,
  ) {}

  // every 50 minutes
  @Cron(CronExpression.EVERY_5_HOURS)
  async retryNotSentNotifications() {
    const batchSize = 10;

    const orders = await this.orderRepo.find({
      where: {
        status: In([OrderStatus.APPROVED, OrderStatus.AUTO_APPROVED]),
        notificationStatus: NotificationStatus.NOT_SENT,
      },
      order: { approvedAt: 'DESC' },
      take: batchSize,
    });

    if (orders.length === 0) {
      this.logger.log(`Retrying notifications for ${orders.length} orders...`);
      return;
    }

    for (const order of orders) {
      try {
        const [user, product, settings] = await Promise.all([
          this.dataSource
            .getRepository(User)
            .findOne({ where: { id: order.userId } }),
          this.dataSource
            .getRepository(Product)
            .findOne({ where: { id: order.productId } }),
          this.dataSource
            .getRepository(UsersSettings)
            .findOne({ where: { userId: order.userId } }),
        ]);

        if (!user) {
          order.notificationStatus = NotificationStatus.NOT_SENT;
          await this.orderRepo.save(order);
          continue;
        }

        const preference =
          settings?.notificationPreference ?? NotificationPreference.EMAIL;

        const productLabel = product?.label ?? `Product #${order.productId}`;

        // NONE
        if (preference === NotificationPreference.NONE) {
          order.notificationStatus = NotificationStatus.SKIPPED;
          await this.orderRepo.save(order);
          this.logger.log(
            `Order ${order.id} (userId=${order.userId}): SKIPPED because preference=NONE.`,
          );
          continue;
        }

        const emailPayload = {
          toEmail: user.email,
          title: 'Purchase Successful',
          template: 'purchase-success',
          templateData: {
            orderId: order.id,
            productLabel: productLabel,
            amount: order.amount,
          },
        };

        // EMAIL
        if (preference === NotificationPreference.EMAIL) {
          if (!user.email) {
            order.notificationStatus = NotificationStatus.NO_CONTACT;
            await this.orderRepo.save(order);
            continue;
          }

          await this.notificationClient.sendEmail(emailPayload);

          order.notificationStatus = NotificationStatus.SENT;
          await this.orderRepo.save(order);
          this.logger.log(`Email sent for order ${order.id}`);
          continue;
        }

        // SMS
        if (preference === NotificationPreference.SMS) {
          const phoneNumber = user.phoneNumber;
          if (!phoneNumber) {
            order.notificationStatus = NotificationStatus.NO_CONTACT;
            await this.orderRepo.save(order);
            continue;
          }

          await this.notificationClient.sendSms({
            toPhoneNumber: phoneNumber,
            message: `Purchase successful. Order: ${order.id}. Product: ${productLabel}.`,
          });

          order.notificationStatus = NotificationStatus.SENT;
          await this.orderRepo.save(order);
          this.logger.log(`SMS sent for order ${order.id}`);
          continue;
        }

        //  ALL
        if (preference === NotificationPreference.ALL) {
          const phoneNumber = user.phoneNumber;
          if (!user.email || !phoneNumber) {
            order.notificationStatus = NotificationStatus.NO_CONTACT;
            await this.orderRepo.save(order);
            continue;
          }

          await Promise.all([
            this.notificationClient.sendEmail(emailPayload),
            this.notificationClient.sendSms({
              toPhoneNumber: phoneNumber,
              message: `Purchase successful. Order: ${order.id}. Product: ${productLabel}.`,
            }),
          ]);

          order.notificationStatus = NotificationStatus.SENT;
          await this.orderRepo.save(order);
          this.logger.log(`Email+SMS sent for order ${order.id}`);
          continue;
        }

        // احتياط
        order.notificationStatus = NotificationStatus.NOT_SENT;
        await this.orderRepo.save(order);
        this.logger.warn(`Unknown preference for user ${order.userId}`);
      } catch (err) {
        // to retry again
        this.logger.warn(
          `Failed to resend notification for order ${order.id}: ${err?.message || err}`,
        );
      }
    }
  }
}
