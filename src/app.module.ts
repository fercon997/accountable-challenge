import { Module } from '@nestjs/common';
import { ReservationModule } from '@reservation/reservation.module';
import { UserModule } from '@user/user.module';
import { BooksModule } from '@book/books.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/accountable'),
    RouterModule.register([
      { path: 'book', module: BooksModule },
      {
        path: 'user',
        module: UserModule,
      },
      { path: 'reservation', module: ReservationModule },
    ]),
    ReservationModule,
    UserModule,
    BooksModule,
  ],
})
export class AppModule {}
