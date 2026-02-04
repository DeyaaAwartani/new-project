import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersSettings } from './entities/users-setting.entity';
import { Repository } from 'typeorm';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Injectable()
export class UsersSettingsService {
  private readonly logger = new Logger(UsersSettingsService.name);

  constructor(
    @InjectRepository(UsersSettings)
    private readonly settingsRepo: Repository<UsersSettings>,
  ) {}

  async updateMyPreference(
    userId: number,
    dto: UpdateNotificationPreferenceDto,
  ) {
    const settings = await this.settingsRepo.findOne({ where: { userId } });
    if (!settings) {
      this.logger.warn(`UsersSettings not found for userId=${userId}`);
      throw new NotFoundException('User settings not found');
    }

    settings.notificationPreference = dto.notificationPreference;
    const saved = await this.settingsRepo.save(settings);

    this.logger.log(
      `UsersSettings updated for userId=${userId}, newPreference=${saved.notificationPreference}`,
    );
    
    return saved;
  }
}
