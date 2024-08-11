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
import {
  BookInventoryService,
  IBookInventoryService,
} from './domain/services/book-inventory';

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
    { provide: IBookInventoryService, useClass: BookInventoryService },
  ],
  exports: [IBookInventoryService],
})
export class ReservationModule {}
