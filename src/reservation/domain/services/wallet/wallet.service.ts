import { Inject, Injectable, Logger } from '@nestjs/common';
import { VersionChangedError } from '@shared/errors';
import { Wallet } from '../../../common/entities';
import { IWalletDao } from '../../../data-access/persistence/dao/wallet-dao';
import {
  WalletNotFoundError,
  InvalidBalanceError,
} from '../../../common/errors';
import { IWalletService } from './wallet-service.interface';

@Injectable()
export class WalletService implements IWalletService {
  constructor(
    @Inject(IWalletDao) private walletDao: IWalletDao,
    @Inject('LoggerService') private logger: Logger,
  ) {}

  private manageNotFound(wallet: Wallet, userId: string) {
    if (!wallet) {
      throw new WalletNotFoundError(this.logger, userId);
    }
  }

  async incrementBalance(userId: string, amount: number): Promise<Wallet> {
    this.logger.log(`Incrementing user ${userId} balance by ${amount}`);
    const result = await this.walletDao.incrementBalance(userId, amount);

    this.manageNotFound(result, userId);

    this.logger.log(`Incremented user ${userId} balance`);
    return result;
  }

  async get(userId: string, reservation?: boolean): Promise<Wallet> {
    this.logger.log(`Getting wallet for user ${userId}`);
    const result = await this.walletDao.get(userId, reservation);

    this.manageNotFound(result, userId);

    this.logger.log(`Found ${userId}`);

    return result;
  }

  async decrementBalance(userId: string, amount: number): Promise<Wallet> {
    this.logger.log(`Deducting ${amount} to user ${userId} balance`);
    const wallet = await this.get(userId);

    if (wallet.balance - amount < 0) {
      throw new InvalidBalanceError(this.logger, userId, amount);
    }

    const result = await this.walletDao.decrementBalance(
      userId,
      amount,
      wallet.version,
    );

    if (!result) {
      throw new VersionChangedError(this.logger, Wallet.name);
    }

    this.logger.log(`Deducted amount from ${userId} balance`);
    return result;
  }
}
