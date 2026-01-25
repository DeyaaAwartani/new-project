import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from './enums/order-status.enum';
import { User } from 'src/users/users.entity';
import { Product } from 'src/products/products.entity';
import { AutoFailureReason } from './enums/auto-failure-reason.enum';
import { ApprovedByType } from './enums/approved-by-type.enum';
import { NotificationStatus } from './enums/notification-status.enum';
import { NotificationAttemptStatus } from './enums/notification-attempt-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.orders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // price at time of order
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.NOT_SENT,
  })
  notificationStatus: NotificationStatus;

  @Column({
    type: 'enum',
    enum: NotificationAttemptStatus,
    default: NotificationAttemptStatus.PENDING,
  })
  notificationAttemptStatus: NotificationAttemptStatus;

  @Column({ type: 'longtext', nullable: true })
  notificationFailureReason: string | null;

  @Column({ type: 'enum', enum: ApprovedByType, nullable: true })
  approvedByType: ApprovedByType | null;

  @Column({ type: 'enum', enum: AutoFailureReason, nullable: true })
  autoFailureReason: AutoFailureReason | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;
}
