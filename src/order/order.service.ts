import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository, DataSource } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { WalletService } from 'src/wallet/wallet.service';
import { OrderStatus } from './enums/order-status.enum';
import { Wallet } from 'src/wallet/wallet.entity';
import { NotificationClientService } from 'src/common/notification-client/notification-client.service';
import { NotificationStatus } from './enums/notification-status.enum';
import { User } from 'src/users/users.entity';
import { Product } from 'src/products/products.entity';
import { ApprovedByType } from './enums/approved-by-type.enum';
import { UsersSettings } from 'src/users-settings/entities/users-setting.entity';
import { NotificationPreference } from 'src/users-settings/enums/notification-preference.enum';
import { NotificationAttemptStatus } from './enums/notification-attempt-status.enum';
import { extractAxiosFailureReason } from 'src/common/utils/axios-error.util';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserOrderCreatedEvent } from 'src/common/events/user-order-created.event';
import { UserPurchaseApprovedEvent } from 'src/common/events/user-purchase-approved.event';
import { InjectQueue } from '@nestjs/bullmq';
import { delay, Queue } from 'bullmq';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
    private readonly notificationClient: NotificationClientService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async creatPendingOrder(userId: number, productId: number) {
    const [product, wallet, existingOrder] = await Promise.all([
      this.productsService.findOne(productId),
      this.walletService.findByUserId(userId),
      this.findExistingOrder(userId, productId, OrderStatus.PENDING),
    ]);

    if (existingOrder)
      throw new ConflictException('Order already pending approval');

    if (!product) throw new NotFoundException('product not found');

    if (!wallet) throw new NotFoundException('wallet not found');

    const price = Number(product.price);
    const balance = Number(wallet.balance);

    if (balance < price)
      throw new BadRequestException('Insufficient wallet balance');

    const order = this.orderRepo.create({
      userId,
      productId,
      amount: Number(product.price).toFixed(2),
      status: OrderStatus.PENDING,
      approvedAt: null,
    });

    const saved = await this.orderRepo.save(order);
    this.eventEmitter.emit(
      'user.order_created',
      new UserOrderCreatedEvent(userId),
    );

    return saved;
  }

  async findExistingOrder(
    userId: number,
    productId: number,
    status: OrderStatus,
  ): Promise<Order | null> {
    return this.orderRepo.findOne({ where: { userId, productId, status } });
  }

  async adminFindPendingPaginated(page = 1, limit = 10) {
    if (page < 1) throw new BadRequestException('page must be >= 1');

    // safety for limit
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const skip = (page - 1) * safeLimit;

    const [items, total] = await this.orderRepo.findAndCount({
      where: { status: OrderStatus.PENDING },
      order: { createdAt: 'DESC' },
      take: safeLimit,
      skip,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async adminApproveOrder(orderId: number): Promise<Order> {
    const approvedOrder = await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const walletRepo = manager.getRepository(Wallet);

      const order = await orderRepo.findOne({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Order not found');

      if (order.status !== OrderStatus.PENDING)
        throw new BadRequestException('Only pending orders can be approved');

      const wallet = await walletRepo.findOne({
        where: { userId: order.userId },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const amount = Number(order.amount);
      const balance = Number(wallet.balance);

      if (balance < amount)
        throw new BadRequestException('Insufficient wallet balance');

      wallet.balance = (balance - amount).toFixed(2);
      await walletRepo.save(wallet);

      order.status = OrderStatus.APPROVED;
      order.approvedAt = new Date();
      order.approvedByType = ApprovedByType.ADMIN;

      // by default not sent
      order.notificationStatus = NotificationStatus.NOT_SENT;
      order.notificationAttemptStatus = NotificationAttemptStatus.PENDING;
      order.notificationFailureReason = null;
      return orderRepo.save(order);
    });

    this.eventEmitter.emit(
      'user.purchase_approved',
      new UserPurchaseApprovedEvent(approvedOrder.userId),
    );

    const [user, product, settings] = await Promise.all([
      this.dataSource
        .getRepository(User)
        .findOne({ where: { id: approvedOrder.userId } }),
      this.dataSource
        .getRepository(Product)
        .findOne({ where: { id: approvedOrder.productId } }),
      this.dataSource
        .getRepository(UsersSettings)
        .findOne({ where: { userId: approvedOrder.userId } }),
    ]);

    if (!user) {
      approvedOrder.notificationStatus = NotificationStatus.NOT_SENT;
      approvedOrder.notificationAttemptStatus =
        NotificationAttemptStatus.FAILED;
      approvedOrder.notificationFailureReason = 'USER_NOT_FOUND';
      return this.orderRepo.save(approvedOrder);
    }

    // If we find no settings for any reason, consider it to be EMAIL (logical default).
    const preference =
      settings?.notificationPreference ?? NotificationPreference.EMAIL;

    // NotificationPreference: None
    if (preference === NotificationPreference.NONE) {
      approvedOrder.notificationStatus = NotificationStatus.SKIPPED;
      approvedOrder.notificationAttemptStatus =
        NotificationAttemptStatus.SUCCESS;
      approvedOrder.notificationFailureReason = null;
      return this.orderRepo.save(approvedOrder);
    }

    const productName = product?.label ?? `Product #${approvedOrder.productId}`;

    //TEMPLATE
    const emailPayload = {
      toEmail: user.email,
      title: 'Purchase Successful',
      template: 'purchase-success',
      templateData: {
        orderId: approvedOrder.id,
        productLabel: productName,
        amount: approvedOrder.amount,
      },
    };

    // NotificationPreference: EMAIL
    if (preference === NotificationPreference.EMAIL) {
      if (!user.email) {
        approvedOrder.notificationStatus = NotificationStatus.NO_CONTACT;
        approvedOrder.notificationAttemptStatus =
          NotificationAttemptStatus.FAILED;
        approvedOrder.notificationFailureReason =
          'NO_CONTACT: user has no email';
        return this.orderRepo.save(approvedOrder);
      }

      try {
        await this.notificationsQueue.add(
          'send_notification',
          {
            orderId: approvedOrder.id,
            userId: approvedOrder.userId,
            type: 'EMAIL',
            payload: emailPayload,
          },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: false,
          },
        );

        approvedOrder.notificationStatus = NotificationStatus.NOT_SENT;
        approvedOrder.notificationAttemptStatus =
          NotificationAttemptStatus.PENDING;
        approvedOrder.notificationFailureReason = null;
      } catch (err) {
        approvedOrder.notificationStatus = NotificationStatus.NOT_SENT;
        approvedOrder.notificationAttemptStatus =
          NotificationAttemptStatus.FAILED;
        approvedOrder.notificationFailureReason =
          extractAxiosFailureReason(err);
      }
      return this.orderRepo.save(approvedOrder);
    }

    // NotificationPreference: SMS
    if (preference === NotificationPreference.SMS) {
      const phoneNumber = user.phoneNumber;
      if (!phoneNumber) {
        approvedOrder.notificationStatus = NotificationStatus.NO_CONTACT;
        approvedOrder.notificationAttemptStatus =
          NotificationAttemptStatus.FAILED;
        approvedOrder.notificationFailureReason =
          'NO_CONTACT: user has no phoneNumber';
        return this.orderRepo.save(approvedOrder);
      }

      const smsPayload = {
        toPhoneNumber: phoneNumber,
        message: `Purchase successful. Order: ${approvedOrder.id}. Product: ${productName}.`,
      };

      await this.notificationsQueue.add(
        'send_notification',
        {
          orderId: approvedOrder.id,
          userId: approvedOrder.userId,
          type: 'SMS',
          payload: smsPayload,
        },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      approvedOrder.notificationStatus = NotificationStatus.NOT_SENT;
      approvedOrder.notificationAttemptStatus =
        NotificationAttemptStatus.PENDING;
      approvedOrder.notificationFailureReason = null;

      return this.orderRepo.save(approvedOrder);
    }

    // NotificationPreference: ALL
    if (preference === NotificationPreference.ALL) {
      const phoneNumber = user.phoneNumber;
      if (!user.email || !phoneNumber) {
        approvedOrder.notificationStatus = NotificationStatus.NO_CONTACT;
        approvedOrder.notificationAttemptStatus =
          NotificationAttemptStatus.FAILED;
        approvedOrder.notificationFailureReason =
          'NO_CONTACT: missing email or phoneNumber';
        return this.orderRepo.save(approvedOrder);
      }

      const smsPayload = {
        toPhoneNumber: phoneNumber,
        message: `Purchase successful. Order: ${approvedOrder.id}. Product: ${productName}.`,
      };

      await this.notificationsQueue.add(
        'send_notification',
        {
          orderId: approvedOrder.id,
          userId: approvedOrder.userId,
          type: 'ALL',
          payload: {
            email: emailPayload,
            sms: smsPayload,
          },
        },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      approvedOrder.notificationStatus = NotificationStatus.NOT_SENT;
      approvedOrder.notificationAttemptStatus =
        NotificationAttemptStatus.PENDING;
      approvedOrder.notificationFailureReason = null;

      return this.orderRepo.save(approvedOrder);
    }

    // احتياط
    approvedOrder.notificationStatus = NotificationStatus.NOT_SENT;
    approvedOrder.notificationAttemptStatus = NotificationAttemptStatus.FAILED;
    approvedOrder.notificationFailureReason = `UNKNOWN_PREFERENCE: ${String(preference)}`;
    return this.orderRepo.save(approvedOrder);
  }

  async adminRejectOrder(orderId: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);

      const order = await orderRepo.findOne({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Order not found');

      if (order.status !== OrderStatus.PENDING)
        throw new BadRequestException('Only pending orders can be rejected');

      order.status = OrderStatus.REJECTED;
      order.approvedAt = new Date();

      return orderRepo.save(order);
    });
  }
}
