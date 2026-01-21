import { Module } from '@nestjs/common';
import { UsersSettingsService } from './users-settings.service';
import { UsersSettingsController } from './users-settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSettings } from './entities/users-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersSettings])],
  controllers: [UsersSettingsController],
  providers: [UsersSettingsService],
  exports: [UsersSettingsService],
})
export class UsersSettingsModule {}
