import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '@shared/shared.module';
import { Book, BookSchema } from './common/entities';
import {
  BookDaoService,
  IBookDao,
} from './data-access/persistence/dao/book-dao';
import { BookService, IBookService } from './domain/services/book';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    SharedModule,
  ],
  providers: [{ provide: IBookDao, useClass: BookDaoService }],
  providers: [
    { provide: IBookDao, useClass: BookDaoService },
    { provide: IBookService, useClass: BookService },
  ],
})
export class BooksModule {}
