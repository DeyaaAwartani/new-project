import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
  ) {}

  async findByUserId(userId: number): Promise<Wallet | null> {
    return this.walletRepo.findOne({ where: { userId } });
  }

  async createForUser(userId: number): Promise<Wallet> {
    const wallet = this.walletRepo.create({ userId, balance: '0' });
    return this.walletRepo.save(wallet);
  }

  async adminAddCredits(userId: number, amount: number) {

    const wallet = await this.walletRepo.findOne({ where: { userId } });

    if (!wallet) throw new NotFoundException('Wallet not found for this user');

    wallet.balance = (Number(wallet.balance) + amount).toFixed(2);
    return this.walletRepo.save(wallet);
  }

}
