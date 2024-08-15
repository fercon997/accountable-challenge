import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { ITransactionService } from '@shared/services/transaction';
import { DaoService } from '@shared/dao.service';
import { DbPaginationOptions, DbPaginationResult } from '@shared/types';
import {
  Reservation,
  ReservationDocument,
  ReservationStatus,
} from '../../../../common/entities';
import { IReservationDao } from './reservation-dao.interface';

@Injectable()
export class ReservationDaoService
  extends DaoService
  implements IReservationDao
{
  constructor(
    @InjectModel(Reservation.name) private model: Model<Reservation>,
    @Inject('LoggerService') logger: LoggerService,
    @Inject(ITransactionService)
    private transactionService: ITransactionService<ClientSession>,
  ) {
    super(logger);
  }

  private parseDbDocument(reservation: ReservationDocument): Reservation {
    return reservation
      ? new Reservation({
          ...reservation.toJSON(),
          price: parseFloat(reservation.price.toString()),
          lateFees: parseFloat(reservation.lateFees.toString()),
        })
      : null;
  }

  async create(reservation: Reservation): Promise<Reservation> {
    try {
      const result: ReservationDocument[] = await this.model.create(
        [reservation],
        {
          session: this.transactionService.getCurrentTransaction(),
        },
      );
      return this.parseDbDocument(result[0]);
    } catch (error) {
      this.throwError('Could not create reservation', error);
    }
  }

  get(
    input: Partial<Reservation>,
    paginationOptions: DbPaginationOptions,
  ): Promise<DbPaginationResult<Reservation>>;
  get(input: Partial<Reservation>): Promise<Reservation[]>;
  async get(
    input: Partial<Reservation>,
    paginationOptions?: DbPaginationOptions,
  ): Promise<Reservation[] | DbPaginationResult<Reservation>> {
    try {
      const filters: FilterQuery<Reservation> = {};
      for (const key in input) {
        if (input[key] === null) {
          filters[key] = { $exists: false };
        } else if (input[key] !== undefined) {
          filters[key] = input[key];
        }
      }
      const query = this.model.find(filters);

      if (paginationOptions) {
        query.limit(paginationOptions.limit).skip(paginationOptions.offset);
        return {
          data: (await query.exec()).map(this.parseDbDocument),
          totalCount: await this.model.find(filters).countDocuments(),
        };
      }

      return (await query).map(this.parseDbDocument);
    } catch (error) {
      this.throwError('Could not get reservations', error);
    }
  }

  async getById(id: string): Promise<Reservation> {
    try {
      const result: ReservationDocument = await this.model.findById(id);
      return this.parseDbDocument(result);
    } catch (error) {
      this.throwError('Could not get reservation', error);
    }
  }

  async update(
    id: string,
    update: Partial<Reservation>,
    version?: number,
  ): Promise<Reservation> {
    try {
      const query: FilterQuery<Reservation> =
        version !== undefined ? { _id: id, version } : { _id: id };
      const updateQuery: UpdateQuery<Reservation> = {};
      for (const key in update) {
        if ((key as keyof Reservation) === 'lateFees') {
          updateQuery.$inc = { [key]: update[key] };
        } else if (update[key] !== undefined) {
          updateQuery[key] = update[key];
        }
      }

      const result: ReservationDocument = await this.model.findOneAndUpdate(
        query,
        updateQuery,
        {
          returnOriginal: false,
          session: this.transactionService.getCurrentTransaction(),
        },
      );

      return this.parseDbDocument(result);
    } catch (error) {
      this.throwError('Could not update reservations', error);
    }
  }

  async getLate(): Promise<Reservation[]> {
    try {
      const result: ReservationDocument[] = await this.model.find({
        returnDate: { $exists: false },
        expectedReturnDate: { $lte: new Date() },
      });

      return result.map(this.parseDbDocument);
    } catch (e) {
      this.throwError('Could not get late reservations', e);
    }
  }

  async getByExpectedReturnDate(
    date: Date,
    status: ReservationStatus,
  ): Promise<Reservation[]> {
    try {
      const result: ReservationDocument[] = await this.model.find({
        status,
        $and: [
          { expectedReturnDate: { $gte: date } },
          { expectedReturnDate: { $lte: date } },
        ],
      });
      return result.map(this.parseDbDocument);
    } catch (e) {
      this.throwError('Could not get soon to be late reservations', e);
    }
  }
}
