import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Response } from '@shared/base.controller';
import { createMock } from '@golevelup/ts-jest';
import { IWalletService } from '../../domain/services/wallet';
import { Reservation, ReservationStatus, Wallet } from '../../common/entities';
import { ReservationDto, WalletDto } from '../../domain/dto';
import { WalletController } from './wallet.controller';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: IWalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: IWalletService, useValue: createMock() }],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get<IWalletService>(IWalletService);
  });

  const id = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();
  const createdAt = new Date();
  const updatedAt = new Date();

  const reservation: ReservationDto = {
    id,
    userId,
    status: ReservationStatus.reserved,
    price: 25,
    reservationDate: new Date(),
    expectedReturnDate: new Date(),
    bookId: '12345ius',
  };
  const walletDto: WalletDto = {
    id,
    userId,
    balance: 25,
    reservations: [reservation],
  };

  const parseDto = (wallet: WalletDto) => {
    return new Wallet({
      ...wallet,
      _id: wallet.id,
      reservations: [
        new Reservation({
          ...reservation,
          _id: reservation.id,
          createdAt,
          updatedAt,
        }),
      ],
      createdAt,
      updatedAt,
    });
  };

  const response: Response<WalletDto> = { statusCode: 200, data: walletDto };

  describe('GET wallet tests', () => {
    it('should return wallet', async () => {
      jest
        .spyOn(walletService, 'get')
        .mockImplementationOnce(async (id: string) => {
          if (id === userId) return parseDto(walletDto);
        });

      expect(await controller.getWallet(userId)).toEqual(response);
    });
  });

  describe('Post balance tests', () => {
    it('should return ', async () => {
      jest
        .spyOn(walletService, 'incrementBalance')
        .mockImplementationOnce(async (id, amount) => {
          if (id === userId) {
            return parseDto({
              ...walletDto,
              balance: walletDto.balance + amount,
            });
          }
        });

      expect(await controller.postAddBalance(userId, { amount: 40 })).toEqual({
        statusCode: 200,
      });
    });
  });
});
