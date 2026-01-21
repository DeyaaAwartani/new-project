import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersSettings } from './entities/users-setting.entity';
import { Repository } from 'typeorm';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Injectable()
export class UsersSettingsService {

  constructor(
    @InjectRepository(UsersSettings) private readonly settingsRepo: Repository<UsersSettings>,
  ) {}

  async updateMyPreference(userId: number, dto: UpdateNotificationPreferenceDto) {
    const settings = await this.settingsRepo.findOne({ where: { userId } });
    if (!settings) throw new NotFoundException('User settings not found');

    settings.notificationPreference = dto.notificationPreference;
    return this.settingsRepo.save(settings);
  }
}
