import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import { ITransactionService } from '@shared/services/transaction';
import { Reservation, ReservationDocument } from '../../../../common/entities';
import { IReservationDao } from './reservation-dao.interface';

@Injectable()
export class ReservationDaoService implements IReservationDao {
  constructor(
    @InjectModel(Reservation.name) private model: Model<Reservation>,
    @Inject('LoggerService') private logger: LoggerService,
    @Inject(ITransactionService)
    private transactionService: ITransactionService<ClientSession>,
  ) {}

  async create(reservation: Reservation): Promise<Reservation> {
    try {
      const result: ReservationDocument = (await this.model.create(
        reservation,
        {
          session: this.transactionService.getCurrentTransaction(),
        },
      )) as unknown as ReservationDocument;
      return this.parseDbDocument(result);
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        'Could not create reservation',
        error,
      );
    }
  }

  async get(input: { userId: string; bookId: string }): Promise<Reservation[]> {
    try {
      const result: ReservationDocument[] = await this.model.find(input);
      return result.map(this.parseDbDocument);
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        'Could not get reservations',
        error,
      );
    }
  }

  async getById(id: string): Promise<Reservation> {
    try {
      const result: ReservationDocument = await this.model.findById(id);
      return this.parseDbDocument(result);
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        'Could not get reservation',
        error,
      );
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

      const result: ReservationDocument = await this.model.findOneAndUpdate(
        query,
        update,
        { session: this.transactionService.getCurrentTransaction() },
      );

      return this.parseDbDocument(result);
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        'Could not update reservations',
        error,
      );
    }
  }

  private parseDbDocument(reservation: ReservationDocument): Reservation {
    return reservation
      ? new Reservation({
          ...reservation.toJSON(),
          price: parseFloat(reservation.price.toString()),
        })
      : null;
  }
}
