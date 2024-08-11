import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { Model, Query, Types } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import { Wallet } from '../../../../common/entities';
import { IWalletDao } from './wallet-dao.interface';
import { WalletDaoService } from './wallet-dao.service';

describe('WalletDaoService', () => {
  let service: IWalletDao;
  let walletModel: Model<Wallet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IWalletDao, useClass: WalletDaoService },
        {
          provide: getModelToken(Wallet.name),
          useValue: createMock(),
        },
        { provide: 'LoggerService', useValue: createMock() },
      ],
    }).compile();

    service = module.get<IWalletDao>(IWalletDao);
    walletModel = module.get<Model<Wallet>>(getModelToken(Wallet.name));
  });

  const _id = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const createdAt = new Date();
  const updatedAt = new Date();
  const wallet: Wallet = {
    userId: userId.toString(),
    balance: 0,
    reservations: [],
  };
  const walletRes: Wallet = {
    ...wallet,
    _id: _id.toString(),
    createdAt,
    updatedAt,
  };

  const updateMock =
    (wallet: Wallet) =>
    ({ userId: id }, { $inc: { balance } }) => {
      if (id === userId.toString()) {
        const wall = {
          ...wallet,
          _id,
          balance: wallet.balance + balance,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        };
        return {
          ...wall,
          toJSON: () => wall,
          balance: new Types.Decimal128(wall.balance.toString()),
        } as unknown as Query<any, any>;
      }
      return null;
    };

  describe('Increment balance tests', () => {
    const mock = updateMock(wallet);

    it('should increment balance by number', async () => {
      jest.spyOn(walletModel, 'findOneAndUpdate').mockImplementationOnce(mock);
      const balance = 15;
      const expectedBalance = wallet.balance + balance;

      expect(
        await service.incrementBalance(userId.toString(), balance),
      ).toEqual({
        ...walletRes,
        balance: expectedBalance,
      });
    });

    it('should return null if not found', async () => {
      jest.spyOn(walletModel, 'findOneAndUpdate').mockImplementationOnce(mock);
      expect(await service.incrementBalance('1asad', 20)).toBeNull();
    });

    it('should throw error if something fails', async () => {
      jest.spyOn(walletModel, 'findOneAndUpdate').mockImplementationOnce(() => {
        throw new Error('could not update');
      });

      await expect(service.incrementBalance('12324', 35)).rejects.toThrow(
        PersistenceError,
      );
    });
  });

  describe('Decrement balance tests', () => {
    const decWallet = { ...wallet, balance: 20 };
    const mock = updateMock(decWallet);
    const walletRes = {
      ...decWallet,
      _id: _id.toString(),
      createdAt,
      updatedAt,
    };

    it('should decrement balance and return it', async () => {
      jest.spyOn(walletModel, 'findOneAndUpdate').mockImplementationOnce(mock);
      const balance = 7;
      const expectedBalance = decWallet.balance - balance;

      expect(
        await service.decrementBalance(userId.toString(), balance),
      ).toEqual({
        ...walletRes,
        balance: expectedBalance,
      });
    });

    it('should return null if not found', async () => {
      jest.spyOn(walletModel, 'findOneAndUpdate').mockImplementationOnce(mock);

      expect(await service.decrementBalance('1asadsa', 12)).toBeNull();
    });

    it('should throw error if something fails', async () => {
      jest.spyOn(walletModel, 'findOneAndUpdate').mockImplementationOnce(() => {
        throw new Error('could not update');
      });

      await expect(service.decrementBalance('12324', 35)).rejects.toThrow(
        PersistenceError,
      );
    });
  });
});
