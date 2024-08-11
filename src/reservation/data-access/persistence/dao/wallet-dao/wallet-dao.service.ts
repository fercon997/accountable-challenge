import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import { Wallet, WalletDocument } from '../../../../common/entities';
import { IWalletDao } from './wallet-dao.interface';

@Injectable()
export class WalletDaoService implements IWalletDao {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @Inject('LoggerService') private logger: LoggerService,
  ) {}

  decrementBalance(userId: string, balance: number): Promise<Wallet> {
    return this.updateBalance(userId, -balance);
  }

  incrementBalance(userId: string, balance: number): Promise<Wallet> {
    return this.updateBalance(userId, balance);
  }

  private parseDbWallet(walletDoc: WalletDocument): Wallet {
    return new Wallet({
      ...walletDoc.toJSON(),
      balance: parseFloat(walletDoc.balance.toString()),
    });
  }

  private async updateBalance(
    userId: string,
    balance: number,
  ): Promise<Wallet> {
    try {
      const result = await this.walletModel.findOneAndUpdate(
        { userId },
        { $inc: { balance: balance } },
      );
      return result ? this.parseDbWallet(result) : null;
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        `Could not update ${userId} wallet by ${balance}`,
        error,
      );
    }
  }
}
