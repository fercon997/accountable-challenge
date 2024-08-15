import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '@shared/shared.module';
import { BooksModule } from '@book/books.module';
import { UsersModule } from '@user/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from '../notification/notifications.module';
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
import { ReservationDaoService } from './data-access/persistence/dao/reservation-dao/reservation-dao.service';
import { IReservationDao } from './data-access/persistence/dao/reservation-dao/reservation-dao.interface';
import { ReservationService } from './domain/services/reservation/reservation.service';
import { ReservationController } from './controllers/reservation/reservation.controller';
import { IReservationService } from './domain/services/reservation/reservation-service.interface';
import { BatchService, IBatchService } from './domain/services/batch';
import { ScheduleService } from './schedules/schedule/schedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: BookInventory.name, schema: BookInventorySchema },
    ]),
    SharedModule,
    forwardRef(() => BooksModule),
    UsersModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    { provide: IBookInventoryDao, useClass: BookInventoryDaoService },
    { provide: IBookInventoryService, useClass: BookInventoryService },
    { provide: IWalletDao, useClass: WalletDaoService },
    { provide: IWalletService, useClass: WalletService },
    { provide: IReservationDao, useClass: ReservationDaoService },
    { provide: IReservationService, useClass: ReservationService },
    { provide: IBatchService, useClass: BatchService },
    ScheduleService,
  ],
  exports: [IBookInventoryService],
  controllers: [WalletController, ReservationController],
})
export class ReservationModule {}
