import { Controller } from '@nestjs/common';
import { ServiceTypesService } from './service_types.service';

@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}
}
