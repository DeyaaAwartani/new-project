import { Module } from '@nestjs/common';
import { ServicePricingService } from './service_pricing.service';
import { ServicePricingController } from './service_pricing.controller';

@Module({
  controllers: [ServicePricingController],
  providers: [ServicePricingService],
})
export class ServicePricingModule {}
