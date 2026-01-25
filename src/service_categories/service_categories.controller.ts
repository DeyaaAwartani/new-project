import { Controller } from '@nestjs/common';
import { ServiceCategoriesService } from './service_categories.service';

@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) {}
}
