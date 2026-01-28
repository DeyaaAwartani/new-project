import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, LessThanOrEqual, Repository } from 'typeorm';
import { Order } from '../order.entity';
import { Wallet } from '../../wallet/wallet.entity';
import { AutoFailureReason } from '../enums/auto-failure-reason.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { ApprovedByType } from '../enums/approved-by-type.enum';
import { ONE_DAY_MS } from 'src/constants/orders.constants';

@Injectable()
export class OrderAutoApproveJob {
  private readonly logger = new Logger(OrderAutoApproveJob.name);

  constructor(private readonly dataSource: DataSource) {}

  @Cron(CronExpression.EVERY_5_HOURS)
  async handleAutoApprove() {
    const now = Date.now();
    const cutoff = new Date(now - ONE_DAY_MS); // the original (ONE_DAY_MS) for test 1 mint 60 * 1000

    //get limit (100)
    const orderRepo = this.dataSource.getRepository(Order);

    const candidates = await orderRepo.find({
      where: {
        status: OrderStatus.PENDING,
        createdAt: LessThanOrEqual(cutoff),
      },
      order: { createdAt: 'ASC' },
      take: 100,
    });

    if (candidates.length === 0) {
      this.logger.log(
        `No pending orders older than 24h (cutoff=${cutoff.toISOString()}).`,
      );
      return;
    }

    this.logger.log(
      `Found ${candidates.length} pending orders older than 24h. Processing...`,
    );

    for (const o of candidates) {
      try {
        await this.processOne(o.id);
      } catch (err: any) {
        this.logger.error(
          `Failed processing order #${o.id}: ${err?.message ?? err}`,
          err?.stack,
        );
      }
    }
  }

  private async processOne(orderId: number) {
    await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const walletRepo = manager.getRepository(Wallet);

      //  lock order (FOR UPDATE)
      const order = await orderRepo
        .createQueryBuilder('o')
        .setLock('pessimistic_write')
        .where('o.id = :id', { id: orderId })
        .getOne();

      if (!order) return; // safe

      //  pending
      if (order.status !== OrderStatus.PENDING) {
        return;
      }

      //  lock wallet for user
      const wallet = await walletRepo
        .createQueryBuilder('w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId', { userId: order.userId })
        .getOne();

      if (!wallet) {
        await this.markAutoFailed(
          orderRepo,
          order,
          AutoFailureReason.WALLET_NOT_FOUND,
        );
        return;
      }

      // check the balance and amount
      const amount = Number(order.amount);
      const balance = Number(wallet.balance);

      if (Number.isNaN(amount) || Number.isNaN(balance)) {
        await this.markAutoFailed(
          orderRepo,
          order,
          AutoFailureReason.UNKNOWN_ERROR,
        );
        return;
      }

      // check balance
      if (balance < amount) {
        await this.markAutoFailed(
          orderRepo,
          order,
          AutoFailureReason.INSUFFICIENT_BALANCE,
        );
        return;
      }

      // discount the value
      wallet.balance = (balance - amount).toFixed(2);
      await walletRepo.save(wallet);

      // success
      order.status = OrderStatus.AUTO_APPROVED;
      order.approvedByType = ApprovedByType.ADMIN;
      order.approvedAt = new Date();
      order.autoFailureReason = null;

      await orderRepo.save(order);
      this.logger.log(`Auto-approved order #${order.id}`);
    });
  }

  private async markAutoFailed(
    orderRepo: Repository<Order>,
    order: Order,
    reason: AutoFailureReason,
  ) {
    this.logger.warn(
      `Auto-approve failed for order #${order.id}, reason=${reason}`,
    );

    order.status = OrderStatus.FAILED_AUTO_APPROVE;
    order.autoFailureReason = reason;
    order.approvedByType = null;
    order.approvedAt = null;

    await orderRepo.save(order);
  }
}
