import { IsEnum } from 'class-validator';
import { NotificationPreference } from '../enums/notification-preference.enum';

export class UpdateNotificationPreferenceDto {
  @IsEnum(NotificationPreference)
  notificationPreference: NotificationPreference;
}
