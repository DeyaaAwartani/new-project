import { Controller } from '@nestjs/common';
import { ServicePricingService } from './service_pricing.service';

@Controller('service-pricing')
export class ServicePricingController {
  constructor(private readonly servicePricingService: ServicePricingService) {}
}
