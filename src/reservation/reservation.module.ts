import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '@shared/shared.module';
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
import {
  WalletDaoService,
  IWalletDao,
} from './data-access/persistence/dao/wallet-dao';
import { WalletService, IWalletService } from './domain/services/wallet';
import { WalletController } from './controllers/wallet/wallet.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: BookInventory.name, schema: BookInventorySchema },
    ]),
    SharedModule,
  ],
  providers: [
    { provide: IBookInventoryDao, useClass: BookInventoryDaoService },
    { provide: IBookInventoryService, useClass: BookInventoryService },
    { provide: IWalletDao, useClass: WalletDaoService },
    { provide: IWalletService, useClass: WalletService },
  ],
  exports: [IBookInventoryService],
  controllers: [WalletController],
})
export class ReservationModule {}
