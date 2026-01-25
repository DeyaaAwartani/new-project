import { Module } from '@nestjs/common';
import { ServiceTypesService } from './service_types.service';
import { ServiceTypesController } from './service_types.controller';

@Module({
  controllers: [ServiceTypesController],
  providers: [ServiceTypesService],
})
export class ServiceTypesModule {}
