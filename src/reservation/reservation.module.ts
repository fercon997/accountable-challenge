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
import {
  BookInventoryDaoService,
  IBookInventoryDao,
} from './data-access/persistence/dao/book-inventory-dao';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: BookInventory.name, schema: BookInventorySchema },
    ]),
  ],
  providers: [
    { provide: IBookInventoryDao, useClass: BookInventoryDaoService },
  ],
})
export class ReservationModule {}
