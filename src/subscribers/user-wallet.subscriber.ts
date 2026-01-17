import { EventSubscriber, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { User } from 'src/users/users.entity';
import { Wallet } from 'src/wallet/wallet.entity'; 

@EventSubscriber()
export class UserWalletSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>): Promise<void> {
    const userId = event.entity?.id;
    if (!userId) return;

    const walletRepo = event.manager.getRepository(Wallet);

    // Safety
    const existing = await walletRepo.findOne({ where: { userId } });
    if (existing) return;

    await walletRepo.save(
      walletRepo.create({
        userId,
        balance: '0',
      }),
    );
  }
}
