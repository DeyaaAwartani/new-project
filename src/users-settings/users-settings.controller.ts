import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersSettingsService } from './users-settings.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/decorators';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@UseGuards(JwtAuthGuard)
@Controller('users-settings')
export class UsersSettingsController {
  constructor(private readonly usersSettingsService: UsersSettingsService) {}

  @Patch('me')
  updateMyPreference(
    @CurrentUserId() userId: number,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    return this.usersSettingsService.updateMyPreference(userId, dto);
  }
}
