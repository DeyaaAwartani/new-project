import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/users.entity';
import { NotificationPreference } from '../enums/notification-preference.enum';

@Entity('users_settings')
export class UsersSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationPreference,
    default: NotificationPreference.EMAIL,
  })
  notificationPreference: NotificationPreference;
}
