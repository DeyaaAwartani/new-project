import { Module } from '@nestjs/common';
import { ServiceCategoriesService } from './service_categories.service';
import { ServiceCategoriesController } from './service_categories.controller';

@Module({
  controllers: [ServiceCategoriesController],
  providers: [ServiceCategoriesService],
})
export class ServiceCategoriesModule {}
