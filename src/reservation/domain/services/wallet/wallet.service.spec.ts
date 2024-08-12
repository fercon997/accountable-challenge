import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Types } from 'mongoose';
import { VersionChangedError } from '@shared/errors';
import { IWalletDao } from '../../../data-access/persistence/dao/wallet-dao';
import { Wallet } from '../../../common/entities';
import {
  WalletNotFoundError,
  InvalidBalanceError,
} from '../../../common/errors';
import { WalletService } from './wallet.service';
import { IWalletService } from './wallet-service.interface';

describe('WalletService', () => {
  let service: IWalletService;
  let walletDao: IWalletDao;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IWalletService, useClass: WalletService },
        {
          provide: IWalletDao,
          useValue: createMock(),
        },
        { provide: 'LoggerService', useValue: createMock() },
      ],
    }).compile();

    service = module.get<IWalletService>(IWalletService);
    walletDao = module.get<IWalletDao>(IWalletDao);
  });

  const userId = new Types.ObjectId().toString();
  const wallet: Wallet = {
    _id: new Types.ObjectId().toString(),
    userId,
    balance: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    reservations: [],
    version: 0,
  };

  const updateMock =
    (options: 'inc' | 'dec', wall = wallet) =>
    async (id: string, balance: number, version?: number): Promise<Wallet> => {
      console.info(userId, version, wall);
      if (
        userId === id &&
        (version === undefined || wall.version === version)
      ) {
        return {
          ...wall,
          balance:
            options === 'inc' ? wall.balance + balance : wall.balance - balance,
        };
      }
      return null;
    };

  const getMock = async (id: string): Promise<Wallet> => {
    if (id === userId) {
      return wallet;
    }
    return null;
  };

  describe('Increment wallet tests', () => {
    beforeEach(() => {
      jest
        .spyOn(walletDao, 'incrementBalance')
        .mockImplementationOnce(updateMock('inc'));
    });

    it('should increment wallet balance', async () => {
      const amount = 7;
      const expectedBalance = wallet.balance + amount;
      expect(await service.incrementBalance(userId, amount)).toEqual({
        ...wallet,
        balance: expectedBalance,
      });
    });

    it('should throw an error if not found', async () => {
      await expect(service.incrementBalance('eqeqw123', 23)).rejects.toThrow(
        WalletNotFoundError,
      );
    });
  });

  describe('Get wallet tests', () => {
    beforeEach(() => {
      jest.spyOn(walletDao, 'get').mockImplementationOnce(getMock);
    });

    it('should return wallet', async () => {
      expect(await service.get(userId)).toEqual(wallet);
    });

    it('should throw an error if not found', async () => {
      await expect(service.get('adasd')).rejects.toThrow(WalletNotFoundError);
    });
  });

  describe('Decrement balance tests', () => {
    const mock = updateMock('dec');
    beforeEach(() => {
      jest.spyOn(walletDao, 'get').mockImplementationOnce(getMock);
    });

    it('should decrement wallet balance', async () => {
      jest.spyOn(walletDao, 'decrementBalance').mockImplementationOnce(mock);
      const amount = 7;
      const balance = wallet.balance - amount;

      expect(await service.decrementBalance(userId, amount)).toEqual({
        ...wallet,
        balance,
      });
    });

    it('should throw error if balance deduction results in a negative number', async () => {
      const amount = 50;

      await expect(service.decrementBalance(userId, amount)).rejects.toThrow(
        InvalidBalanceError,
      );
    });

    it('should throw an error if value was changed before update', async () => {
      jest
        .spyOn(walletDao, 'decrementBalance')
        .mockImplementationOnce(updateMock('dec', { ...wallet, version: 1 }));

      await expect(service.decrementBalance(userId, 5)).rejects.toThrow(
        VersionChangedError,
      );
    });
  });
});
