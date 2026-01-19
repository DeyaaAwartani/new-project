import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { ProductsModule } from 'src/products/products.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { AuthModule } from 'src/auth/auth.module';
import { OrderAutoApproveJob } from './jobs/order-auto-approve.job';
import { NotificationClientModule } from 'src/common/notification-client/notification-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ProductsModule,
    WalletModule,
    AuthModule,
    NotificationClientModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderAutoApproveJob],
  exports: [OrderService, TypeOrmModule],
})
export class OrderModule {}
