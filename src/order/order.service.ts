import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository, DataSource } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { WalletService } from 'src/wallet/wallet.service';
import { OrderStatus } from './enums/order-status.enum';
import { Wallet } from 'src/wallet/wallet.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly walletService: WalletService,
    private readonly dataSource: DataSource,
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
    return this.orderRepo.save(order);
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
    return this.dataSource.transaction(async (manager) => {
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
      return orderRepo.save(order);
    });
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
