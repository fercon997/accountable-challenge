import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ResponsePaginated } from '@shared/base.controller';
import { UsersModule } from '@user/users.module';
import { SharedModule } from '@shared/shared.module';
import { AuthGuard } from '@shared/guards';
import { IReservationService } from '../../domain/services/reservation/reservation-service.interface';
import { ReservationDto } from '../../domain/dto';
import { Reservation, ReservationStatus } from '../../common/entities';
import { ReservationController } from './reservation.controller';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: IReservationService;

  const userId = 'asd781287asdb';
  const bookId = '12134243sc';
  const id = 'asm123nsda1213';

  const reservationDto: ReservationDto = {
    id,
    userId,
    bookId,
    status: ReservationStatus.pending,
    expectedReturnDate: new Date(),
    price: 3,
    reservationDate: new Date(),
  };

  const reservationFromDto = (reservationDto: ReservationDto) =>
    new Reservation({ ...reservationDto, _id: reservationDto.id });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: IReservationService,
          useValue: createMock<IReservationService>(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(createMock())
      .compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get<IReservationService>(IReservationService);
  });

  describe('GET /history', () => {
    beforeEach(() => {});

    it('should return reservations paginated', async () => {
      const resultPaginated: ResponsePaginated<ReservationDto> = {
        data: [reservationDto],
        totalCount: 1,
        totalPages: 1,
        nextPage: null,
        page: 1,
        statusCode: 200,
      };

      jest
        .spyOn(service, 'getPaginated')
        .mockImplementationOnce(async (filters, { page, pageSize }) => {
          return {
            data: [reservationFromDto(reservationDto)],
            totalCount: 1,
            page,
            pageSize,
          };
        });

      expect(
        await controller.getReservationsHistory({ page: 1, pageSize: 10 }),
      ).toEqual(resultPaginated);
    });
  });

  describe('POST reservations', () => {
    it('should create reservation', async () => {
      const date = new Date();
      const expected = {
        ...reservationDto,
        expectedReturnDate: date,
      };

      jest
        .spyOn(service, 'createReservation')
        .mockImplementationOnce(async (userId, bookId, date) => {
          return reservationFromDto({
            ...reservationDto,
            userId,
            bookId,
            expectedReturnDate: date,
          });
        });

      expect(
        await controller.createReservation(
          {
            bookId,
            expectedReturnDate: date,
          },
          userId,
        ),
      ).toEqual({
        data: expected,
        statusCode: 200,
      });
    });
  });

  describe('PATCH cancel reservation tests', () => {
    it('should return canceled reservation', async () => {
      jest.spyOn(service, 'cancelReservation').mockResolvedValueOnce(
        reservationFromDto({
          ...reservationDto,
          status: ReservationStatus.canceled,
        }),
      );

      expect(await controller.cancelReservation(id, userId)).toEqual({
        data: { ...reservationDto, status: ReservationStatus.canceled },
        statusCode: 200,
      });
    });
  });

  describe('Patch pay reservation tests', () => {
    it('should returned paid reservation', async () => {
      jest.spyOn(service, 'payReservation').mockResolvedValueOnce(
        reservationFromDto({
          ...reservationDto,
          status: ReservationStatus.reserved,
        }),
      );

      expect(await controller.payReservation(id, userId)).toEqual({
        data: { ...reservationDto, status: ReservationStatus.reserved },
        statusCode: 200,
      });
    });
  });

  describe('Patch end reservation tests', () => {
    it('should return returned reservation', async () => {
      const returnDate = new Date();
      jest.spyOn(service, 'endReservation').mockResolvedValueOnce(
        reservationFromDto({
          ...reservationDto,
          status: ReservationStatus.returned,
          returnDate,
        }),
      );

      expect(await controller.endReservation(id, userId)).toEqual({
        data: {
          ...reservationDto,
          status: ReservationStatus.returned,
          returnDate,
        },
        statusCode: 200,
      });
    });
  });
});
