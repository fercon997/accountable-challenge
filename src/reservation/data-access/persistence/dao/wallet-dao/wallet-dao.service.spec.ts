import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { FilterQuery, Model, Query, Types } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import {
  Reservation,
  ReservationDocument,
  ReservationStatus,
  Wallet,
  WalletDocument,
} from '../../../../common/entities';
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
    version: 0,
  };
  const walletRes: Wallet = {
    ...wallet,
    _id: _id.toString(),
    createdAt,
    updatedAt,
  };

  const reservation: Reservation = {
    bookId: 'adasd',
    userId: userId.toString(),
    price: 25,
    reservationDate: new Date(),
    expectedReturnDate: new Date(),
    status: ReservationStatus.reserved,
  };

  const reservationRes: Reservation = {
    ...reservation,
    _id: _id.toString(),
    createdAt,
    updatedAt,
  };

  const walletWithReserve: Wallet = {
    ...walletRes,
    reservations: [reservationRes],
  };

  const genWalletDoc = (wallet: Wallet) => {
    const wall = {
      ...wallet,
      _id,
      balance: wallet.balance,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
    return {
      ...wall,
      toJSON: () => wall,
      balance: new Types.Decimal128(wall.balance.toString()),
    } as unknown as WalletDocument;
  };

  const genResDoc = (reservation: Reservation) => {
    const res = {
      ...reservation,
      _id,
      price: reservation.price,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
    return {
      ...res,
      toJSON: () => res,
      price: new Types.Decimal128(reservation.price.toString()),
    } as unknown as ReservationDocument;
  };

  const updateMock =
    (wallet: Wallet) =>
    ({ userId: id, version }, { $inc: { balance } }) => {
      if (
        id === userId.toString() &&
        (!version || wallet.version === version)
      ) {
        const wall = genWalletDoc(wallet);
        const actualBalance = parseFloat(wall.balance.toString());
        return {
          ...wall,
          balance: new Types.Decimal128((actualBalance + balance).toString()),
        } as unknown as Query<any, any>;
      }
      return null;
    };

  const get = (id: string) => {
    if (id === userId.toString()) {
      return genWalletDoc(wallet);
    }
  };

  const getMock = ({ userId: id }: FilterQuery<Wallet>): Query<any, any> => {
    const wallet = get(id);
    if (wallet) {
      return {
        ...wallet,
        populate() {
          this.reservations = [genResDoc(reservation)];
        },
      } as unknown as Query<any, any>;
    }
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

  describe('Get balance tests', () => {
    it('should return wallet', async () => {
      jest.spyOn(walletModel, 'findOne').mockImplementationOnce(getMock);
      const result = await service.get(userId.toString());
      expect(result).toEqual(walletRes);
      expect(result).toBeInstanceOf(Wallet);
    });

    it('should return null if not found', async () => {
      jest.spyOn(walletModel, 'findOne').mockImplementationOnce(getMock);
      expect(await service.get('123123as')).toBeNull();
    });

    it('should throw an error if something fails', async () => {
      jest.spyOn(walletModel, 'findOne').mockImplementationOnce(() => {
        throw new Error('couldnt get');
      });

      await expect(service.get('asa112312')).rejects.toThrow(PersistenceError);
    });

    it('should call populate when asked for', async () => {
      jest.spyOn(walletModel, 'findOne').mockImplementationOnce(getMock);

      const result = await service.get(userId.toString(), true);
      expect(result).toEqual(walletWithReserve);
      expect(result).toBeInstanceOf(Wallet);
      expect(result.reservations).toHaveLength(1);
      expect(result.reservations[0]).toEqual(reservationRes);
      expect(result.reservations[0]).toBeInstanceOf(Reservation);
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

    it('should return null if version not found', async () => {
      jest.spyOn(walletModel, 'findOneAndUpdate').mockImplementationOnce(mock);

      expect(
        await service.decrementBalance(userId.toString(), 5, 1),
      ).toBeNull();
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
