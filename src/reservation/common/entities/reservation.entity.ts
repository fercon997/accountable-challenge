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
}

@Schema({ autoIndex: true, versionKey: 'version' })
export class Reservation extends Entity {
  @Prop({ type: schema.Types.ObjectId, required: true })
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

  @Prop({ type: schema.Types.Decimal128 })
  lateFees?: number;

  @Prop({
    type: String,
    enum: ReservationStatus,
    default: ReservationStatus.pending,
  })
  status: ReservationStatus;

  constructor(reservation: Reservation) {
    super(reservation);
    this.bookId = reservation.bookId;
    this.userId = reservation.userId;
    this.reservationDate = reservation.reservationDate;
    this.expectedReturnDate = reservation.expectedReturnDate;
    this.returnDate = reservation.returnDate;
    this.lateFees = reservation.lateFees;
    this.status = reservation.status;
    this.price = reservation.price;
  }
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.index({ userId: 1, bookId: 1 }, { unique: true });
