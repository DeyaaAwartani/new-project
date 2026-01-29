import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../auth/enums/user-role.enum';
import { Wallet } from 'src/wallet/wallet.entity';
import { Order } from 'src/order/order.entity';
import { UsersSettings } from 'src/users-settings/entities/users-setting.entity';
import { UserInteraction } from 'src/user-interaction/entities/user-interaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
  phoneNumber: string | null;

  @OneToOne(() => UsersSettings, (settings) => settings.user)
  settings: UsersSettings;

  @OneToMany(() => UserInteraction, (interaction) => interaction.user)
  interactions: UserInteraction[];

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
