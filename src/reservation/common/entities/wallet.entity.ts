import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as schema, HydratedDocument } from 'mongoose';
import { Entity } from '@shared/entity';
import { Reservation } from './reservation.entity';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ timestamps: true, versionKey: 'version' })
export class Wallet extends Entity {
  @Prop({
    type: schema.Types.ObjectId,
    required: true,
    unique: true,
  })
  userId: string;

  @Prop({ type: schema.Types.Decimal128, required: true })
  balance: number;

  @Prop({
    type: [{ type: schema.Types.ObjectId, ref: 'Reservation' }],
    maxlength: 3,
  })
  reservations?: Reservation[];

  version?: number;

  constructor(wallet: Wallet) {
    super(wallet);
    this.balance = wallet.balance;
    this.reservations = wallet.reservations;
    this.userId = wallet.userId;
    this.version = wallet.version;
  }
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
