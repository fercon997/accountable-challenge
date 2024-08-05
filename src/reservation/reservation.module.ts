import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BookInventory,
  BookInventorySchema,
  Reservation,
  ReservationSchema,
  Wallet,
  WalletSchema,
} from './common/entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: BookInventory.name, schema: BookInventorySchema },
    ]),
  ],
})
export class ReservationModule {}
