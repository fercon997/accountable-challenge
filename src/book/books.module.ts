import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '@shared/shared.module';
import { ReservationModule } from '@reservation/reservation.module';
import { Book, BookSchema } from './common/entities';
import {
  BookDaoService,
  IBookDao,
} from './data-access/persistence/dao/book-dao';
import { BookController } from './controllers/book';
import { BookService, IBookService } from './domain/services/book';

@Module({
  imports: [
    forwardRef(() => ReservationModule),
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    SharedModule,
  ],
  providers: [
    { provide: IBookDao, useClass: BookDaoService },
    { provide: IBookService, useClass: BookService },
  ],
  controllers: [BookController],
  exports: [IBookService],
})
export class BooksModule {}
