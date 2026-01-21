import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';
import { User } from 'src/users/users.entity';
import { Wallet } from 'src/wallet/wallet.entity';
import { UsersSettings } from 'src/users-settings/entities/users-setting.entity';
import { NotificationPreference } from 'src/users-settings/enums/notification-preference.enum';

@EventSubscriber()
export class UserWalletSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>): Promise<void> {
    const userId = event.entity?.id;
    if (!userId) return;

    const walletRepo = event.manager.getRepository(Wallet);
    const settingsRepo = event.manager.getRepository(UsersSettings);

    const [existingSettings, existingWallet] = await Promise.all([
      settingsRepo.findOne({ where: { userId } }),
      walletRepo.findOne({ where: { userId } }),
    ]);
    // Safety
    if (!existingWallet) {
      await walletRepo.save(
        walletRepo.create({
          userId,
          balance: '0',
        }),
      );
    }

    if (!existingSettings) {
      await settingsRepo.save(
        settingsRepo.create({
          userId,
          notificationPreference: NotificationPreference.EMAIL, // default
        }),
      );
    }
  }
}
