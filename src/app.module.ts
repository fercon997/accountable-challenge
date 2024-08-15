import { Module } from '@nestjs/common';
import { ReservationModule } from '@reservation/reservation.module';
import { UsersModule } from '@user/users.module';
import { BooksModule } from '@book/books.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RouterModule } from '@nestjs/core';
import { NotificationsModule } from './notification/notifications.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/accountable', {
      serverSelectionTimeoutMS: 100,
    }),
    RouterModule.register([
      { path: 'book', module: BooksModule },
      {
        path: 'user',
        module: UsersModule,
      },
      { path: 'reservation', module: ReservationModule },
    ]),
    ReservationModule,
    UsersModule,
    BooksModule,
    NotificationsModule,
  ],
  providers: [],
})
export class AppModule {}
