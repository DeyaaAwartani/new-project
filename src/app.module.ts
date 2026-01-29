import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';
import { User } from './users/users.entity';
import { Product } from './products/products.entity';
import { WalletModule } from './wallet/wallet.module';
import { Wallet } from './wallet/wallet.entity';
import { UserWalletSubscriber } from './subscribers/user-wallet.subscriber';
import { OrderModule } from './order/order.module';
import { Order } from './order/order.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersSettingsModule } from './users-settings/users-settings.module';
import { UsersSettings } from './users-settings/entities/users-setting.entity';
import { ServiceCategoriesModule } from './service_categories/service_categories.module';
import { ServicesModule } from './services/services.module';
import { ServiceTypesModule } from './service_types/service_types.module';
import { ServicePricingModule } from './service_pricing/service_pricing.module';
import { UserInteractionModule } from './user-interaction/user-interaction.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsQueueModule } from './notifications-queue/notifications-queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dev',
      entities: [User, Product, Wallet, Order, UsersSettings],
      autoLoadEntities: true,
      synchronize: false,
      subscribers: [UserWalletSubscriber],
    }),
    BullModule.forRoot({
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    NotificationsQueueModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    WalletModule,
    OrderModule,
    AdminModule,
    UsersSettingsModule,
    ServiceCategoriesModule,
    ServicesModule,
    ServiceTypesModule,
    ServicePricingModule,
    UserInteractionModule,
    NotificationsQueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
