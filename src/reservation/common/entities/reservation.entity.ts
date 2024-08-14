import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as schema } from 'mongoose';
import { Entity } from '@shared/entity';

export type ReservationDocument = HydratedDocument<Reservation>;

export enum ReservationStatus {
  pending = 'pending',
  reserved = 'reserved',
  late = 'late',
  bought = 'bought',
  returned = 'returned',
  canceled = 'canceled',
}

@Schema({ autoIndex: true, versionKey: 'version' })
export class Reservation extends Entity {
  @Prop({ required: true })
  bookId: string;

  @Prop({ type: schema.Types.ObjectId, required: true })
  userId: string;

  @Prop({ type: schema.Types.Decimal128, required: true })
  price: number;

  @Prop({ required: true })
  reservationDate: Date;

  @Prop({ required: true })
  expectedReturnDate: Date;

  @Prop({ required: false })
  returnDate?: Date;

  @Prop({ type: schema.Types.Decimal128, default: 0 })
  lateFees?: number;

  @Prop({
    enum: ReservationStatus,
    default: ReservationStatus.pending,
    index: true,
  })
  status?: ReservationStatus;

  version?: number;

  constructor(reservation: Reservation) {
    super(reservation);
    this.bookId = reservation.bookId?.toString();
    this.userId = reservation.userId?.toString();
    this.reservationDate = reservation.reservationDate;
    this.expectedReturnDate = reservation.expectedReturnDate;
    this.returnDate = reservation.returnDate;
    this.lateFees = reservation.lateFees;
    this.status = reservation.status;
    this.price = reservation.price;
    this.version = reservation.version;
  }
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.index({ bookId: 1, userId: 1 }, { unique: true });
/* istanbul ignore next */
ReservationSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { $inc: { version: 1 } });
  next();
});
