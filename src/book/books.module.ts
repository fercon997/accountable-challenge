import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '@shared/shared.module';
import { Book, BookSchema } from './common/entities';
import {
  BookDaoService,
  IBookDao,
} from './data-access/persistence/dao/book-dao';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    SharedModule,
  ],
  providers: [{ provide: IBookDao, useClass: BookDaoService }],
})
export class BooksModule {}
