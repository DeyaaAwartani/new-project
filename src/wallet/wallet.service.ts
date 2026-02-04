import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
  ) {}

  async findByUserId(userId: number): Promise<Wallet | null> {
    return this.walletRepo.findOne({ where: { userId } });
  }

  async createForUser(userId: number): Promise<Wallet> {
    const wallet = this.walletRepo.create({ userId, balance: '0' });
    const saved = await this.walletRepo.save(wallet);

    this.logger.log(
      `Wallet created for userId=${userId}, walletId=${saved.id}`,
    );
    return saved;
  }

  async adminAddCredits(userId: number, amount: number) {
    const wallet = await this.walletRepo.findOne({ where: { userId } });

    if (!wallet) {
      this.logger.warn(`wallet not fount for userId=${userId}`);
      throw new NotFoundException('Wallet not found for this user');
    }

    wallet.balance = (Number(wallet.balance) + amount).toFixed(2);

    const saved = await this.walletRepo.save(wallet);

    this.logger.log(
      `AdminAddCredits success userId=${userId}, amount=${amount}, newBalance=${saved.balance}`,
    );

    return saved;
  }
}
